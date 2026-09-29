import { OrderModel } from '../models/order.model.js';

class OrderRepository {
  async insertMany(orders) {
    return OrderModel.insertMany(orders);
  }

  async count(filter = {}) {
    return OrderModel.countDocuments(filter);
  }

  async sample(size, { excludeIds = [] } = {}) {
    const pipeline = [];
    if (excludeIds.length > 0) {
      pipeline.push({ $match: { _id: { $nin: excludeIds } } });
    }
    pipeline.push({ $sample: { size } });
    return OrderModel.aggregate(pipeline);
  }
}

export const orderRepository = new OrderRepository();
