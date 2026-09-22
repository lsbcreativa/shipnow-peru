import { fakerES as faker } from '@faker-js/faker';
import { ROLES, ORDER_STATUS, ORDER_PRIORITY, DELIVERY_STATUS } from '../constants/index.js';
import { userRepository } from '../repositories/user.repository.js';
import { orderRepository } from '../repositories/order.repository.js';
import { deliveryRepository } from '../repositories/delivery.repository.js';
import { AppError } from '../utils/app-error.js';

const PERU_CITIES = [
  'Lima',
  'Arequipa',
  'Cusco',
  'Trujillo',
  'Chiclayo',
  'Piura',
  'Iquitos',
  'Huancayo',
  'Tacna',
  'Ica',
];

const CATALOG_ITEMS = [
  'Chompa de alpaca',
  'Poncho andino',
  'Cafe de Chanchamayo',
  'Chocolate de Cusco',
  'Ceviche en conserva',
  'Turron de Doña Pepa',
  'Textil de Ayacucho',
  'Ceramica de Chulucanas',
];

const DEFAULT_QTY = 5;
const MAX_QTY = 50;
const MOCKABLE_ROLES = [ROLES.CLIENTE, ROLES.REPARTIDOR];
const VALID_COLLECTIONS = ['usuarios', 'repartidores', 'pedidos', 'entregas'];

const clampQty = (qty) => {
  const parsed = Number(qty);
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULT_QTY;
  return Math.min(parsed, MAX_QTY);
};

const randomFrom = (list) => list[Math.floor(Math.random() * list.length)];

const buildUser = (role = randomFrom(MOCKABLE_ROLES)) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName, provider: 'test.com' }).toLowerCase(),
    city: randomFrom(PERU_CITIES),
    role,
  };
};

const buildOrderItem = () => ({
  name: randomFrom(CATALOG_ITEMS),
  quantity: faker.number.int({ min: 1, max: 5 }),
  unitPrice: Number(faker.commerce.price({ min: 10, max: 300 })),
});

const buildOrderItems = () => Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, buildOrderItem);

const sumItems = (items) => Number(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2));

const buildOrderPreview = () => {
  const items = buildOrderItems();
  return {
    customer: buildUser(ROLES.CLIENTE),
    items,
    totalAmount: sumItems(items),
    destinationCity: randomFrom(PERU_CITIES),
    status: randomFrom(Object.values(ORDER_STATUS)),
    priority: randomFrom(Object.values(ORDER_PRIORITY)),
  };
};

const buildDeliveryAddress = (city) => `${randomFrom(['Av.', 'Jr.', 'Calle'])} ${faker.location.street()}, ${city}`;

const buildDeliveryPreview = () => {
  const order = buildOrderPreview();
  const status = randomFrom(Object.values(DELIVERY_STATUS));
  const hasDeliveryPerson = status !== DELIVERY_STATUS.PENDING;

  return {
    order,
    deliveryPerson: hasDeliveryPerson ? buildUser(ROLES.REPARTIDOR) : null,
    deliveryAddress: buildDeliveryAddress(order.destinationCity),
    status,
  };
};

class MockService {
  generateUsers(qty) {
    return Array.from({ length: clampQty(qty) }, () => buildUser());
  }

  generateRepartidores(qty) {
    return Array.from({ length: clampQty(qty) }, () => buildUser(ROLES.REPARTIDOR));
  }

  generateOrders(qty) {
    return Array.from({ length: clampQty(qty) }, buildOrderPreview);
  }

  generateDeliveries(qty) {
    return Array.from({ length: clampQty(qty) }, buildDeliveryPreview);
  }

  async seed(coleccion = 'usuarios', qty) {
    const normalized = (coleccion || 'usuarios').toLowerCase().trim();
    const size = clampQty(qty);

    if (!VALID_COLLECTIONS.includes(normalized)) {
      throw new AppError(
        `La coleccion "${coleccion}" no es valida. Usa una de: ${VALID_COLLECTIONS.join(', ')}.`,
        400
      );
    }

    switch (normalized) {
      case 'usuarios':
        return this._seedUsers(size);
      case 'repartidores':
        return this._seedRepartidores(size);
      case 'pedidos':
        return this._seedOrders(size);
      case 'entregas':
        return this._seedDeliveries(size);
      default:
        throw new AppError(`La coleccion "${coleccion}" no es valida.`, 400);
    }
  }

  async _seedUsers(size) {
    const users = Array.from({ length: size }, () => buildUser());
    const inserted = await userRepository.insertMany(users);
    return { insertados: inserted.length, coleccion: 'usuarios' };
  }

  async _seedRepartidores(size) {
    const inserted = await userRepository.insertMany(
      Array.from({ length: size }, () => buildUser(ROLES.REPARTIDOR))
    );
    return { insertados: inserted.length, coleccion: 'repartidores' };
  }

  async _seedOrders(size) {
    const customers = await this._ensureUsersByRole(ROLES.CLIENTE, size);
    const orders = Array.from({ length: size }, () => {
      const items = buildOrderItems();
      return {
        customer: randomFrom(customers)._id,
        items,
        totalAmount: sumItems(items),
        destinationCity: randomFrom(PERU_CITIES),
        status: randomFrom(Object.values(ORDER_STATUS)),
        priority: randomFrom(Object.values(ORDER_PRIORITY)),
      };
    });

    const inserted = await orderRepository.insertMany(orders);
    return { insertados: inserted.length, coleccion: 'pedidos' };
  }

  async _seedDeliveries(size) {
    const orders = await this._ensureOrders(size);
    const deliveryPeople = await this._ensureUsersByRole(ROLES.REPARTIDOR, Math.max(1, Math.ceil(size / 2)));

    const deliveries = orders.slice(0, size).map((order) => {
      const status = randomFrom(Object.values(DELIVERY_STATUS));
      const hasDeliveryPerson = status !== DELIVERY_STATUS.PENDING;
      return {
        order: order._id,
        deliveryPerson: hasDeliveryPerson ? randomFrom(deliveryPeople)._id : null,
        deliveryAddress: buildDeliveryAddress(order.destinationCity || randomFrom(PERU_CITIES)),
        status,
      };
    });

    const inserted = await deliveryRepository.insertMany(deliveries);
    return { insertados: inserted.length, coleccion: 'entregas' };
  }

  async _ensureUsersByRole(role, minCount) {
    const existing = await userRepository.sampleByRole(role, minCount);
    if (existing.length >= minCount) return existing;

    const missing = minCount - existing.length;
    const created = await userRepository.insertMany(Array.from({ length: missing }, () => buildUser(role)));
    return [...existing, ...created];
  }

  async _ensureOrders(minCount) {
    const existing = await orderRepository.sample(minCount);
    if (existing.length >= minCount) return existing;

    const missing = minCount - existing.length;
    const customers = await this._ensureUsersByRole(ROLES.CLIENTE, missing);
    const newOrders = customers.map((customer) => {
      const items = buildOrderItems();
      return {
        customer: customer._id,
        items,
        totalAmount: sumItems(items),
        destinationCity: randomFrom(PERU_CITIES),
        status: randomFrom(Object.values(ORDER_STATUS)),
        priority: randomFrom(Object.values(ORDER_PRIORITY)),
      };
    });

    const created = await orderRepository.insertMany(newOrders);
    return [...existing, ...created];
  }
}

export const mockService = new MockService();
