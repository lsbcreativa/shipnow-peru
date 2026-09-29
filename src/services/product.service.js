import { productRepository } from '../repositories/product.repository.js';
import { PRODUCT_STATUS } from '../constants/index.js';
import { NotFoundError, ValidationError, ConflictError, InvalidStatusError } from '../errors/index.js';

const resolveStatusByStock = (stock) => (stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK);

class ProductService {
  async list({ page = 1, limit = 10, category, city, status } = {}) {
    if (status && !Object.values(PRODUCT_STATUS).includes(status)) {
      throw new InvalidStatusError(status, Object.values(PRODUCT_STATUS));
    }

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
      throw new NotFoundError('No encontramos ese producto en el catalogo de ShipNow Peru');
    }
    return product;
  }

  async create(data) {
    const { name, description, category, price, stock = 0, city } = data;

    if (!name || !description || !category || !city) {
      throw new ValidationError('Faltan datos obligatorios del producto');
    }
    if (price === undefined || price === null || Number(price) < 0) {
      throw new ValidationError('El precio tiene que ser un numero mayor o igual a cero');
    }
    if (Number(stock) < 0) {
      throw new ValidationError('El stock no puede ser negativo');
    }

    const existing = await productRepository.findByName(name);
    if (existing) {
      throw new ConflictError('Ya existe un producto registrado con ese nombre');
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
      throw new ConflictError('Un producto discontinuado ya no se puede modificar');
    }

    const nextChanges = { ...changes };
    delete nextChanges.status;

    if (nextChanges.price !== undefined && Number(nextChanges.price) < 0) {
      throw new ValidationError('El precio tiene que ser un numero mayor o igual a cero');
    }

    if (nextChanges.stock !== undefined) {
      if (Number(nextChanges.stock) < 0) {
        throw new ValidationError('El stock no puede ser negativo');
      }
      nextChanges.status = resolveStatusByStock(nextChanges.stock);
    }

    return productRepository.updateById(id, nextChanges);
  }

  async remove(id) {
    const current = await this.getById(id);

    if (current.status === PRODUCT_STATUS.DISCONTINUED) {
      throw new ConflictError('Este producto ya esta discontinuado');
    }

    return productRepository.updateById(id, { status: PRODUCT_STATUS.DISCONTINUED });
  }
}

export const productService = new ProductService();
