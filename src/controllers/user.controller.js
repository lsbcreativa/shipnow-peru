import { userService } from '../services/user.service.js';
import { successResponse } from '../utils/http-response.js';

export const listUsers = async (req, res, next) => {
  try {
    const { page, limit, city } = req.query;
    const result = await userService.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      city,
    });
    successResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    successResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    successResponse(res, 201, user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.update(req.params.id, req.body);
    successResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await userService.remove(req.params.id);
    successResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};
