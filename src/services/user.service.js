import { userRepository } from '../repositories/user.repository.js';
import { ROLES } from '../constants/index.js';
import { AppError } from '../utils/app-error.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class UserService {
  async list({ page = 1, limit = 10, city } = {}) {
    const filter = {};
    if (city) filter.city = city;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      userRepository.findAll({ filter, skip, limit }),
      userRepository.count(filter),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('No encontramos ese usuario en ShipNow Peru', 404);
    }
    return user;
  }

  async create(data) {
    const { firstName, lastName, email, city } = data;

    if (!firstName || !lastName || !email || !city) {
      throw new AppError('Faltan datos obligatorios del usuario', 400);
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new AppError('El correo no tiene un formato valido', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new AppError('Ya existe un usuario registrado con ese correo', 409);
    }

    return userRepository.create({
      firstName,
      lastName,
      email: normalizedEmail,
      city,
      role: ROLES.USER,
    });
  }

  async update(id, changes) {
    await this.getById(id);

    const nextChanges = { ...changes };
    delete nextChanges.role;
    delete nextChanges.isActive;

    if (nextChanges.email) {
      if (!EMAIL_REGEX.test(nextChanges.email)) {
        throw new AppError('El correo no tiene un formato valido', 400);
      }

      nextChanges.email = nextChanges.email.toLowerCase().trim();
      const existing = await userRepository.findByEmail(nextChanges.email);
      if (existing && String(existing._id) !== String(id)) {
        throw new AppError('Ya existe un usuario registrado con ese correo', 409);
      }
    }

    return userRepository.updateById(id, nextChanges);
  }

  async remove(id) {
    await this.getById(id);
    return userRepository.deactivateById(id);
  }
}

export const userService = new UserService();
