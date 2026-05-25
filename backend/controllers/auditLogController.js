const auditLogRepository = require('../repositories/auditLogRepository');

class AuditLogController {
  async getAllLogs(req, res, next) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
      }
      const logs = await auditLogRepository.findAll();
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuditLogController();
