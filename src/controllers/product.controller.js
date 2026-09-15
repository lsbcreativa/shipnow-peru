import { productService } from '../services/product.service.js';
import { successResponse } from '../utils/http-response.js';

export const listProducts = async (req, res, next) => {
  try {
    const { page, limit, category, city, status } = req.query;
    const result = await productService.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      category,
      city,
      status,
    });
    successResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    successResponse(res, 200, product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.create(req.body);
    successResponse(res, 201, product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.update(req.params.id, req.body);
    successResponse(res, 200, product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.remove(req.params.id);
    successResponse(res, 200, product);
  } catch (error) {
    next(error);
  }
};
