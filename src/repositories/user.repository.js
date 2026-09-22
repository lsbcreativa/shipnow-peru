import { UserModel } from '../models/user.model.js';

const DEFAULT_PROJECTION = '-__v';

class UserRepository {
  async findAll({ filter = {}, skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) {
    const query = { isActive: true, ...filter };
    return UserModel.find(query, DEFAULT_PROJECTION).sort(sort).skip(skip).limit(limit);
  }

  async count(filter = {}) {
    return UserModel.countDocuments({ isActive: true, ...filter });
  }

  async findById(id) {
    return UserModel.findOne({ _id: id, isActive: true }, DEFAULT_PROJECTION);
  }

  async findByEmail(email) {
    return UserModel.findOne({ email });
  }

  async create(data) {
    return UserModel.create(data);
  }

  async insertMany(users) {
    return UserModel.insertMany(users);
  }

  async sampleByRole(role, size) {
    return UserModel.aggregate([{ $match: { role, isActive: true } }, { $sample: { size } }]);
  }

  async updateById(id, changes) {
    return UserModel.findByIdAndUpdate(id, changes, { new: true, runValidators: true }).select(
      DEFAULT_PROJECTION
    );
  }

  async deactivateById(id) {
    return UserModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).select(DEFAULT_PROJECTION);
  }
}

export const userRepository = new UserRepository();
