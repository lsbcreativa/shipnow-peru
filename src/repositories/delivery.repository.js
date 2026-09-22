import { DeliveryModel } from '../models/delivery.model.js';

class DeliveryRepository {
  async insertMany(deliveries) {
    return DeliveryModel.insertMany(deliveries);
  }

  async count(filter = {}) {
    return DeliveryModel.countDocuments(filter);
  }
}

export const deliveryRepository = new DeliveryRepository();
