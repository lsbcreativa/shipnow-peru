import { fakerES as faker } from '@faker-js/faker';
import { ROLES, ORDER_STATUS, ORDER_PRIORITY, DELIVERY_STATUS } from '../constants/index.js';
import { userRepository } from '../repositories/user.repository.js';
import { orderRepository } from '../repositories/order.repository.js';
import { deliveryRepository } from '../repositories/delivery.repository.js';
import { InvalidMockQuantityError, InvalidMockCollectionError, MockSeedError, ValidationError } from '../errors/index.js';
import { logger } from '../config/logger.config.js';

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

// null = qty ok (o ausente). si no, devuelve el mensaje del problema -> lo usan tanto
// los generadores sueltos (tiran InvalidMockQuantityError directo) como el seed (que
// junta este problema con el de la coleccion antes de tirar nada).
const qtyProblem = (qty) => {
  if (qty === undefined || qty === null || qty === '') return null;
  const parsed = Number(qty);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return `La cantidad "${qty}" no es valida: qty tiene que ser un numero entero mayor a cero`;
  }
  return null;
};

const parseQty = (qty) => {
  if (qtyProblem(qty)) throw new InvalidMockQuantityError(qty);
  if (qty === undefined || qty === null || qty === '') return DEFAULT_QTY;

  const parsed = Number(qty);
  if (parsed > MAX_QTY) {
    logger.warning(`se pidieron ${parsed} registros via mocks, se recorta al tope de ${MAX_QTY}`);
  }
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

const buildOrderData = (customerId) => {
  const items = buildOrderItems();
  return {
    customer: customerId,
    items,
    totalAmount: sumItems(items),
    destinationCity: randomFrom(PERU_CITIES),
    status: randomFrom(Object.values(ORDER_STATUS)),
    priority: randomFrom(Object.values(ORDER_PRIORITY)),
  };
};

const buildOrderPreview = () => buildOrderData(buildUser(ROLES.CLIENTE));

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
    return Array.from({ length: parseQty(qty) }, () => buildUser());
  }

  generateRepartidores(qty) {
    return Array.from({ length: parseQty(qty) }, () => buildUser(ROLES.REPARTIDOR));
  }

  generateOrders(qty) {
    return Array.from({ length: parseQty(qty) }, buildOrderPreview);
  }

  generateDeliveries(qty) {
    return Array.from({ length: parseQty(qty) }, buildDeliveryPreview);
  }

  async seed(coleccion = 'usuarios', qty) {
    const normalized = (coleccion || 'usuarios').toLowerCase().trim();
    const collectionInvalid = !VALID_COLLECTIONS.includes(normalized);
    const badQty = qtyProblem(qty);

    // si ambos parametros vienen mal, los devolvemos los dos juntos en vez de
    // solo el primero que pintaba el codigo viejo (lo marcó el profe).
    if (collectionInvalid && badQty) {
      throw new ValidationError('Hay mas de un dato invalido en la peticion de seed', [
        `La coleccion "${coleccion}" no es valida. Usa una de: ${VALID_COLLECTIONS.join(', ')}.`,
        badQty,
      ]);
    }

    if (collectionInvalid) {
      throw new InvalidMockCollectionError(coleccion, VALID_COLLECTIONS);
    }

    const size = parseQty(qty);

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
        throw new InvalidMockCollectionError(coleccion, VALID_COLLECTIONS);
    }
  }

  async _seedUsers(size) {
    try {
      const users = Array.from({ length: size }, () => buildUser());
      const inserted = await userRepository.insertMany(users);
      logger.info(`mocks: se cargaron ${inserted.length} usuarios de prueba`);
      return { insertados: inserted.length, coleccion: 'usuarios' };
    } catch (error) {
      throw new MockSeedError('usuarios', error);
    }
  }

  async _seedRepartidores(size) {
    try {
      const inserted = await userRepository.insertMany(
        Array.from({ length: size }, () => buildUser(ROLES.REPARTIDOR))
      );
      logger.info(`mocks: se cargaron ${inserted.length} repartidores de prueba`);
      return { insertados: inserted.length, coleccion: 'repartidores' };
    } catch (error) {
      throw new MockSeedError('repartidores', error);
    }
  }

  async _seedOrders(size) {
    try {
      const customers = await this._ensureUsersByRole(ROLES.CLIENTE, size);
      const orders = Array.from({ length: size }, () => buildOrderData(randomFrom(customers)._id));

      const inserted = await orderRepository.insertMany(orders);
      logger.info(`mocks: se cargaron ${inserted.length} pedidos de prueba`);
      return { insertados: inserted.length, coleccion: 'pedidos' };
    } catch (error) {
      if (error instanceof MockSeedError) throw error;
      throw new MockSeedError('pedidos', error);
    }
  }

  async _seedDeliveries(size) {
    try {
      const orders = await this._ensureOrdersWithoutDelivery(size);
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
      logger.info(`mocks: se cargaron ${inserted.length} entregas de prueba`);
      return { insertados: inserted.length, coleccion: 'entregas' };
    } catch (error) {
      if (error instanceof MockSeedError) throw error;
      throw new MockSeedError('entregas', error);
    }
  }

  async _ensureUsersByRole(role, minCount) {
    const existing = await userRepository.sampleByRole(role, minCount);
    if (existing.length >= minCount) return existing;

    const missing = minCount - existing.length;
    const created = await userRepository.insertMany(Array.from({ length: missing }, () => buildUser(role)));
    return [...existing, ...created];
  }

  // Solo devuelve pedidos que todavia no tienen una entrega asociada, para no
  // generar mas de una entrega por pedido cuando el seed se corre varias veces.
  async _ensureOrdersWithoutDelivery(minCount) {
    const deliveredOrderIds = await deliveryRepository.findOrderIdsWithDelivery();
    const existing = await orderRepository.sample(minCount, { excludeIds: deliveredOrderIds });
    if (existing.length >= minCount) return existing;

    const missing = minCount - existing.length;
    const customers = await this._ensureUsersByRole(ROLES.CLIENTE, missing);
    const newOrders = customers.map((customer) => buildOrderData(customer._id));

    const created = await orderRepository.insertMany(newOrders);
    return [...existing, ...created];
  }
}

export const mockService = new MockService();
