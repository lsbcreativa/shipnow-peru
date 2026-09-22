import { mockService } from '../services/mock.service.js';

export const mockUsers = (req, res, next) => {
  try {
    res.status(200).json(mockService.generateUsers(req.query.qty));
  } catch (error) {
    next(error);
  }
};

export const mockRepartidores = (req, res, next) => {
  try {
    res.status(200).json(mockService.generateRepartidores(req.query.qty));
  } catch (error) {
    next(error);
  }
};

export const mockOrders = (req, res, next) => {
  try {
    res.status(200).json(mockService.generateOrders(req.query.qty));
  } catch (error) {
    next(error);
  }
};

export const mockDeliveries = (req, res, next) => {
  try {
    res.status(200).json(mockService.generateDeliveries(req.query.qty));
  } catch (error) {
    next(error);
  }
};

export const seedMocks = async (req, res, next) => {
  try {
    const result = await mockService.seed(req.query.coleccion, req.query.qty);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
