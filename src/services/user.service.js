import { userRepository } from '../repositories/user.repository.js';
import { ROLES } from '../constants/index.js';
import { NotFoundError, ValidationError, ConflictError } from '../errors/index.js';
import { parsePagination } from '../utils/pagination.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class UserService {
  async list({ page, limit, city } = {}) {
    const { page: parsedPage, limit: parsedLimit } = parsePagination({ page, limit });

    const filter = {};
    if (city) filter.city = city;

    const skip = (parsedPage - 1) * parsedLimit;
    const [items, total] = await Promise.all([
      userRepository.findAll({ filter, skip, limit: parsedLimit }),
      userRepository.count(filter),
    ]);

    return {
      items,
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit) || 1,
    };
  }

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('No encontramos ese usuario en ShipNow Peru');
    }
    return user;
  }

  async create(data) {
    const { firstName, lastName, email, city } = data;

    if (!firstName || !lastName || !email || !city) {
      throw new ValidationError('Faltan datos obligatorios del usuario');
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new ValidationError('El correo no tiene un formato valido');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('Ya existe un usuario registrado con ese correo');
    }

    return userRepository.create({
      firstName,
      lastName,
      email: normalizedEmail,
      city,
      role: ROLES.CLIENTE,
    });
  }

  async update(id, changes) {
    await this.getById(id);

    const nextChanges = { ...changes };
    delete nextChanges.role;
    delete nextChanges.isActive;

    if (nextChanges.email) {
      if (!EMAIL_REGEX.test(nextChanges.email)) {
        throw new ValidationError('El correo no tiene un formato valido');
      }

      nextChanges.email = nextChanges.email.toLowerCase().trim();
      const existing = await userRepository.findByEmail(nextChanges.email);
      if (existing && String(existing._id) !== String(id)) {
        throw new ConflictError('Ya existe un usuario registrado con ese correo');
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
