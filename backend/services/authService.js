const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const auditLogRepository = require('../repositories/auditLogRepository');

class AuthService {
  async register(userData, creatorIp = '') {
    const username = String(userData.username || '').trim();
    const email = String(userData.email || '').trim().toLowerCase();
    const password = String(userData.password || '');
    const role = String(userData.role || '').trim().toLowerCase();
    const gradeLevel = userData.gradeLevel || '';
    const classes = userData.classes || [];
    const avatar = userData.avatar || '';

    if (!username || !email || !password || !role) {
      throw new Error('Please provide username, email, password, and role');
    }

    // Check if user exists
    const emailExists = await userRepository.findByEmail(email);
    if (emailExists) throw new Error('Email is already registered');

    const usernameExists = await userRepository.findByUsername(username);
    if (usernameExists) throw new Error('Username is already taken');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userRepository.create({
      username,
      email,
      password: hashedPassword,
      role,
      gradeLevel,
      classes,
      avatar
    });

    await auditLogRepository.log(
      newUser._id,
      'USER_REGISTER',
      `User ${username} was registered with role ${role}.`,
      creatorIp
    );

    return newUser;
  }

  async login(email, password, ipAddress = '') {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) throw new Error('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid email or password');

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'super_secret_school_board_key_2026',
      { expiresIn: '30d' }
    );

    await auditLogRepository.log(
      user._id,
      'LOGIN',
      `User ${user.username} logged in successfully.`,
      ipAddress
    );

    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;

    return { user: safeUser, token };
  }

  async bulkImport(csvText, adminId, ipAddress = '') {
    // Basic CSV parser
    const lines = csvText.split('\n');
    const importedUsers = [];
    const errors = [];

    // Skip header row: username,email,password,role,gradeLevel,classes
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(',');
      if (columns.length < 4) {
        errors.push(`Line ${i + 1}: Insufficient columns`);
        continue;
      }

      const [username, email, password, role, gradeLevel, classesStr] = columns.map(c => c.trim());
      const classes = classesStr ? classesStr.split(';').map(c => c.trim()) : [];

      try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await userRepository.create({
          username,
          email,
          password: hashedPassword,
          role,
          gradeLevel: gradeLevel || '',
          classes: classes || []
        });

        importedUsers.push(newUser);
      } catch (err) {
        errors.push(`Line ${i + 1} (${username || email}): ${err.message}`);
      }
    }

    await auditLogRepository.log(
      adminId,
      'USER_BULK_IMPORT',
      `Admin bulk imported ${importedUsers.length} users. Failures: ${errors.length}.`,
      ipAddress
    );

    return { importedCount: importedUsers.length, errors };
  }

  async getAllUsers() {
    return await userRepository.findAll();
  }
}

module.exports = new AuthService();
