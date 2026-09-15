import { productRepository } from '../repositories/product.repository.js';
import { PRODUCT_STATUS } from '../constants/index.js';
import { AppError } from '../utils/app-error.js';

const resolveStatusByStock = (stock) => (stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK);

class ProductService {
  async list({ page = 1, limit = 10, category, city, status } = {}) {
    const filter = {};
    if (category) filter.category = category;
    if (city) filter.city = city;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      productRepository.findAll({ filter, skip, limit }),
      productRepository.count(filter),
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
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError('No encontramos ese producto en el catalogo de ShipNow Peru', 404);
    }
    return product;
  }

  async create(data) {
    const { name, description, category, price, stock = 0, city } = data;

    if (!name || !description || !category || !city) {
      throw new AppError('Faltan datos obligatorios del producto', 400);
    }
    if (price === undefined || price === null || Number(price) < 0) {
      throw new AppError('El precio tiene que ser un numero mayor o igual a cero', 400);
    }
    if (Number(stock) < 0) {
      throw new AppError('El stock no puede ser negativo', 400);
    }

    const existing = await productRepository.findByName(name);
    if (existing) {
      throw new AppError('Ya existe un producto registrado con ese nombre', 409);
    }

    return productRepository.create({
      name,
      description,
      category,
      price,
      stock,
      city,
      status: resolveStatusByStock(stock),
    });
  }

  async update(id, changes) {
    const current = await this.getById(id);

    if (current.status === PRODUCT_STATUS.DISCONTINUED) {
      throw new AppError('Un producto discontinuado ya no se puede modificar', 409);
    }

    const nextChanges = { ...changes };
    delete nextChanges.status;

    if (nextChanges.price !== undefined && Number(nextChanges.price) < 0) {
      throw new AppError('El precio tiene que ser un numero mayor o igual a cero', 400);
    }

    if (nextChanges.stock !== undefined) {
      if (Number(nextChanges.stock) < 0) {
        throw new AppError('El stock no puede ser negativo', 400);
      }
      nextChanges.status = resolveStatusByStock(nextChanges.stock);
    }

    return productRepository.updateById(id, nextChanges);
  }

  async remove(id) {
    const current = await this.getById(id);

    if (current.status === PRODUCT_STATUS.DISCONTINUED) {
      throw new AppError('Este producto ya esta discontinuado', 409);
    }

    return productRepository.updateById(id, { status: PRODUCT_STATUS.DISCONTINUED });
  }
}

export const productService = new ProductService();
