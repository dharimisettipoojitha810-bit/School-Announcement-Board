const Category = require('../models/Category');

class CategoryRepository {
  async findAll() {
    return await Category.find().populate('createdBy', 'username email role');
  }

  async findById(id) {
    return await Category.findById(id).populate('createdBy', 'username email role');
  }

  async findByName(name) {
    return await Category.findOne({ name });
  }

  async create(categoryData) {
    const category = new Category(categoryData);
    return await category.save();
  }

  async update(id, updateData) {
    return await Category.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await Category.findByIdAndDelete(id);
  }
}

module.exports = new CategoryRepository();
