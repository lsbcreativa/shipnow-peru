import { ProductModel } from '../models/product.model.js';
import { PRODUCT_STATUS } from '../constants/index.js';

const DEFAULT_PROJECTION = '-__v';

class ProductRepository {
  async findAll({ filter = {}, skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) {
    const query = { ...filter };

    if (!query.status) {
      query.status = { $ne: PRODUCT_STATUS.DISCONTINUED };
    }

    return ProductModel.find(query, DEFAULT_PROJECTION).sort(sort).skip(skip).limit(limit);
  }

  async count(filter = {}) {
    const query = { ...filter };

    if (!query.status) {
      query.status = { $ne: PRODUCT_STATUS.DISCONTINUED };
    }

    return ProductModel.countDocuments(query);
  }

  async findById(id) {
    return ProductModel.findById(id, DEFAULT_PROJECTION);
  }

  async findByName(name) {
    return ProductModel.findOne({ name }, DEFAULT_PROJECTION);
  }

  async create(data) {
    return ProductModel.create(data);
  }

  async updateById(id, changes) {
    return ProductModel.findByIdAndUpdate(id, changes, { new: true, runValidators: true }).select(
      DEFAULT_PROJECTION
    );
  }
}

export const productRepository = new ProductRepository();
