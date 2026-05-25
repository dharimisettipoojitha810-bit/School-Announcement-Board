const categoryRepository = require('../repositories/categoryRepository');
const auditLogRepository = require('../repositories/auditLogRepository');

class CategoryService {
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error('Category not found');
    return category;
  }

  async createCategory(categoryData, adminId, ipAddress = '') {
    const { name, description, colorHex } = categoryData;

    // Check unique category name
    const existing = await categoryRepository.findByName(name);
    if (existing) throw new Error('Category already exists');

    const category = await categoryRepository.create({
      name,
      description,
      colorHex,
      createdBy: adminId
    });

    await auditLogRepository.log(
      adminId,
      'CREATE_CATEGORY',
      `Category '${name}' created.`,
      ipAddress
    );

    return category;
  }

  async updateCategory(id, updateData, adminId, ipAddress = '') {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error('Category not found');

    const updated = await categoryRepository.update(id, updateData);

    await auditLogRepository.log(
      adminId,
      'UPDATE_CATEGORY',
      `Category '${category.name}' updated to '${updated.name}'.`,
      ipAddress
    );

    return updated;
  }

  async deleteCategory(id, adminId, ipAddress = '') {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error('Category not found');

    await categoryRepository.delete(id);

    await auditLogRepository.log(
      adminId,
      'DELETE_CATEGORY',
      `Category '${category.name}' deleted.`,
      ipAddress
    );

    return category;
  }
}

module.exports = new CategoryService();
