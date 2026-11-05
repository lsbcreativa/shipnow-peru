import { OrderModel } from '../models/order.model.js';

const PROJECTION = '-__v';

class OrderRepository {
  async findAll({ filter = {}, skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) {
    return OrderModel.find(filter, PROJECTION).populate('customer', PROJECTION).sort(sort).skip(skip).limit(limit);
  }

  async findById(id) {
    return OrderModel.findById(id, PROJECTION).populate('customer', PROJECTION);
  }

  async create(data) {
    const order = await OrderModel.create(data);
    return this.findById(order._id);
  }

  async updateStatusById(id, status) {
    await OrderModel.findByIdAndUpdate(id, { status }, { runValidators: true });
    return this.findById(id);
  }

  async addReceipt(id, receipt) {
    await OrderModel.findByIdAndUpdate(id, { $push: { receipts: receipt } }, { runValidators: true });
    return this.findById(id);
  }

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
