import mongoose from 'mongoose';
import { DELIVERY_STATUS } from '../constants/index.js';

const deliverySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    deliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    deliveryAddress: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      default: DELIVERY_STATUS.PENDING,
    },
  },
  { timestamps: true }
);

export const DeliveryModel = mongoose.model('Delivery', deliverySchema);
