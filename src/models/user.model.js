import mongoose from 'mongoose';
import { ROLES, USER_DOCUMENT_TYPES } from '../constants/index.js';

const documentSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    documentType: { type: String, enum: Object.values(USER_DOCUMENT_TYPES), required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    city: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CLIENTE,
    },
    isActive: { type: Boolean, default: true },
    documents: { type: [documentSchema], default: [] },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model('User', userSchema);
