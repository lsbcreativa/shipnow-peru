import { OrderModel } from '../models/order.model.js';

class OrderRepository {
  async insertMany(orders) {
    return OrderModel.insertMany(orders);
  }

  async count(filter = {}) {
    return OrderModel.countDocuments(filter);
  }

  async sample(size) {
    return OrderModel.aggregate([{ $sample: { size } }]);
  }
}

export const orderRepository = new OrderRepository();
