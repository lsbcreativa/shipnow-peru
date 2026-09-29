import { mockService } from '../services/mock.service.js';
import { successResponse } from '../utils/http-response.js';

export const mockUsers = (req, res, next) => {
  try {
    successResponse(res, 200, mockService.generateUsers(req.query.qty));
  } catch (error) {
    next(error);
  }
};

export const mockRepartidores = (req, res, next) => {
  try {
    successResponse(res, 200, mockService.generateRepartidores(req.query.qty));
  } catch (error) {
    next(error);
  }
};

export const mockOrders = (req, res, next) => {
  try {
    successResponse(res, 200, mockService.generateOrders(req.query.qty));
  } catch (error) {
    next(error);
  }
};

export const mockDeliveries = (req, res, next) => {
  try {
    successResponse(res, 200, mockService.generateDeliveries(req.query.qty));
  } catch (error) {
    next(error);
  }
};

export const seedMocks = async (req, res, next) => {
  try {
    const result = await mockService.seed(req.query.coleccion, req.query.qty);
    successResponse(res, 201, result);
  } catch (error) {
    next(error);
  }
};
