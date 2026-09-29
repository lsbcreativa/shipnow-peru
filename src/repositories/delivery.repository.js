import { DeliveryModel } from '../models/delivery.model.js';

class DeliveryRepository {
  async insertMany(deliveries) {
    return DeliveryModel.insertMany(deliveries);
  }

  async count(filter = {}) {
    return DeliveryModel.countDocuments(filter);
  }

  async findOrderIdsWithDelivery() {
    return DeliveryModel.distinct('order');
  }
}

export const deliveryRepository = new DeliveryRepository();
