const authService = require('../services/authService');
const auditLogRepository = require('../repositories/auditLogRepository');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body, req.ip);
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: user
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
      }
      const data = await authService.login(email, password, req.ip);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        ...data
      });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      // req.user was set by authMiddleware
      res.status(200).json({
        success: true,
        data: req.user
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async bulkImport(req, res, next) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
      }
      const { csvText } = req.body;
      if (!csvText) {
        return res.status(400).json({ success: false, message: 'No CSV data provided' });
      }
      const result = await authService.bulkImport(csvText, req.user._id, req.ip);
      res.status(200).json({
        success: true,
        message: 'CSV Bulk import processing complete',
        data: result
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllUsers(req, res, next) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
      }
      const users = await authService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();
