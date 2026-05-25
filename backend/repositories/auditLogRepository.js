const AuditLog = require('../models/AuditLog');

class AuditLogRepository {
  async log(userId, action, description, ipAddress = '') {
    const logEntry = new AuditLog({
      user: userId || null,
      action,
      description,
      ipAddress
    });
    return await logEntry.save();
  }

  async findAll() {
    return await AuditLog.find()
      .populate('user', 'username email role')
      .sort({ createdAt: -1 })
      .limit(100); // safety cap for dashboard performance
  }
}

module.exports = new AuditLogRepository();
