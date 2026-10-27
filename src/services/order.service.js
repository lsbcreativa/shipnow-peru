import { orderRepository } from '../repositories/order.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { ORDER_STATUS, ORDER_PRIORITY } from '../constants/index.js';
import { NotFoundError, ValidationError, ConflictError, InvalidStatusError } from '../errors/index.js';
import { parsePagination } from '../utils/pagination.js';

const sumItems = (items) => Number(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2));

const validItem = (item) =>
  item &&
  typeof item.name === 'string' &&
  item.name.trim() !== '' &&
  Number.isFinite(item.quantity) &&
  item.quantity > 0 &&
  Number.isFinite(item.unitPrice) &&
  item.unitPrice >= 0;

class OrderService {
  async list({ page, limit, status, city } = {}) {
    if (status && !Object.values(ORDER_STATUS).includes(status)) {
      throw new InvalidStatusError(status, Object.values(ORDER_STATUS));
    }

    const { page: parsedPage, limit: parsedLimit } = parsePagination({ page, limit });

    const filter = {};
    if (status) filter.status = status;
    if (city) filter.destinationCity = city;

    const skip = (parsedPage - 1) * parsedLimit;
    const [items, total] = await Promise.all([
      orderRepository.findAll({ filter, skip, limit: parsedLimit }),
      orderRepository.count(filter),
    ]);

    return { items, page: parsedPage, limit: parsedLimit, total, totalPages: Math.ceil(total / parsedLimit) || 1 };
  }

  async getById(id) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError('No encontramos ese pedido en ShipNow Peru');
    }
    return order;
  }

  async create(data) {
    const { customer, items, destinationCity, priority } = data;

    if (!customer || !destinationCity) {
      throw new ValidationError('Faltan datos obligatorios del pedido (customer, destinationCity)');
    }
    if (!Array.isArray(items) || items.length === 0 || !items.every(validItem)) {
      throw new ValidationError('El pedido necesita al menos un item valido (name, quantity > 0, unitPrice >= 0)');
    }
    if (priority && !Object.values(ORDER_PRIORITY).includes(priority)) {
      throw new ValidationError(
        `La prioridad "${priority}" no es valida. Usa una de: ${Object.values(ORDER_PRIORITY).join(', ')}.`
      );
    }

    const customerExists = await userRepository.findById(customer);
    if (!customerExists) {
      throw new NotFoundError('El cliente indicado no existe (o esta desactivado)');
    }

    return orderRepository.create({
      customer,
      items,
      totalAmount: sumItems(items),
      destinationCity,
      priority: priority || ORDER_PRIORITY.MEDIUM,
    });
  }

  async updateStatus(id, status) {
    if (!status || !Object.values(ORDER_STATUS).includes(status)) {
      throw new InvalidStatusError(status, Object.values(ORDER_STATUS));
    }

    const current = await this.getById(id);
    if (current.status === ORDER_STATUS.CANCELLED) {
      throw new ConflictError('Un pedido cancelado no admite mas cambios de estado');
    }

    return orderRepository.updateStatusById(id, status);
  }
}

export const orderService = new OrderService();
