const User = require('../models/User');

class UserRepository {
  async findById(id) {
    return await User.findById(id).select('-password');
  }

  async findByEmail(email) {
    if (!email) return null;
    return await User.findOne({ email: String(email).trim().toLowerCase() });
  }

  async findByUsername(username) {
    return await User.findOne({ username });
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async bulkCreate(usersArray) {
    return await User.insertMany(usersArray);
  }

  async findAll() {
    return await User.find().select('-password');
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }
}

module.exports = new UserRepository();
