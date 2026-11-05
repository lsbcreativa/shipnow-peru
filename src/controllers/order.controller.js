import fs from 'fs';
import { orderService } from '../services/order.service.js';
import { successResponse } from '../utils/http-response.js';

export const listOrders = async (req, res, next) => {
  try {
    const { page, limit, status, city } = req.query;
    const result = await orderService.list({ page, limit, status, city });
    successResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getById(req.params.id);
    successResponse(res, 200, order);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.create(req.body);
    successResponse(res, 201, order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateStatus(req.params.id, req.body.status);
    successResponse(res, 200, order);
  } catch (error) {
    next(error);
  }
};

export const uploadOrderReceipt = async (req, res, next) => {
  try {
    const order = await orderService.addReceipt(req.params.id, req.file);
    successResponse(res, 201, order);
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
};
