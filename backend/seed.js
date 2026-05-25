require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');
const Announcement = require('./models/Announcement');
const Comment = require('./models/Comment');
const AuditLog = require('./models/AuditLog');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_board');
    console.log('Connected to MongoDB for seeding...');

    // Clear all existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Announcement.deleteMany({});
    await Comment.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Cleared existing database collections.');

    // 1. Create Mock Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      username: 'admin',
      email: 'admin@school.com',
      password: passwordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    });

    const teacher1 = await User.create({
      username: 'Mr. Davis',
      email: 'davis@school.com',
      password: passwordHash,
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    });

    const teacher2 = await User.create({
      username: 'Mrs. Smith',
      email: 'smith@school.com',
      password: passwordHash,
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    });

    const student1 = await User.create({
      username: 'Alex Green',
      email: 'alex@school.com',
      password: passwordHash,
      role: 'student',
      gradeLevel: 'Grade 9',
      classes: ['Class 9-A'],
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'
    });

    const student2 = await User.create({
      username: 'Emma Watson',
      email: 'emma@school.com',
      password: passwordHash,
      role: 'student',
      gradeLevel: 'Grade 10',
      classes: ['Class 10-A'],
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80'
    });

    const parent1 = await User.create({
      username: 'John Green',
      email: 'john@school.com',
      password: passwordHash,
      role: 'parent',
      gradeLevel: 'Grade 9',
      classes: ['Class 9-A'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    });

    console.log('Seeded 6 sample users (Admin, Teachers, Students, Parents).');

    // 2. Create Categories
    const sports = await Category.create({
      name: 'Sports',
      description: 'Athletic competitions, schedules, and club news',
      colorHex: '#10B981', // Emerald
      createdBy: admin._id
    });

    const academics = await Category.create({
      name: 'Academics',
      description: 'Syllabi, exam schedules, homework, and reports',
      colorHex: '#6366F1', // Indigo
      createdBy: admin._id
    });

    const holidays = await Category.create({
      name: 'Holidays',
      description: 'Term breaks, public holiday announcements',
      colorHex: '#A78BFA', // Purple
      createdBy: admin._id
    });

    const emergencies = await Category.create({
      name: 'Emergencies',
      description: 'Immediate notices, weather advisories, lockdowns',
      colorHex: '#EF4444', // Red
      createdBy: admin._id
    });

    console.log('Seeded 4 category tags (Sports, Academics, Holidays, Emergencies).');

    // 3. Create Announcements
    const announcement1 = await Announcement.create({
      title: 'URGENT: Temporary School Closure Due to Impending Blizzard',
      content: 'Due to severe weather forecasts and safety concerns, school will remain closed tomorrow, **May 22, 2026**. All classes will shift to virtual formats on Google Meet. Teachers will post links in their respective classroom portals. Stay safe and warm!',
      author: admin._id,
      category: emergencies._id,
      targetAudience: 'all',
      priority: 'urgent',
      isPinned: true,
      commentsEnabled: true,
      publishAt: new Date(),
      views: [
        { user: student1._id, viewedAt: new Date() },
        { user: student2._id, viewedAt: new Date() }
      ]
    });

    const announcement2 = await Announcement.create({
      title: 'Grade 9 Mathematics Midterm Examination Schedule',
      content: 'The Grade 9 midterm exam schedules are officially locked. Testing will commence next week starting Monday, **May 25, 2026**. Students are advised to be seated in Room 204 at least 15 minutes before the exam time. Bring a calculator, pencils, and scrap paper. Revision sheets are attached.',
      author: teacher1._id,
      category: academics._id,
      targetAudience: 'grade',
      targetValue: 'Grade 9',
      priority: 'high',
      isPinned: true,
      signatureRequired: true,
      commentsEnabled: true,
      publishAt: new Date(),
      attachments: [
        { name: 'Grade_9_Maths_Syllabus.pdf', path: '/uploads/Grade_9_Maths_Syllabus.pdf' }
      ]
    });

    const announcement3 = await Announcement.create({
      title: 'Class 9-A Physics Field Trip Consent Form',
      content: 'We are organizing an educational field trip to the National Science Observatory for Class 9-A students on Friday, **June 5, 2026**. Transportation and snacks will be provided by the school. A typed digital parent signature is required to register consent.',
      author: teacher1._id,
      category: academics._id,
      targetAudience: 'class',
      targetValue: 'Class 9-A',
      priority: 'normal',
      signatureRequired: true,
      commentsEnabled: false,
      publishAt: new Date(),
      signatures: [
        { user: parent1._id, signatureText: 'John Green', signedAt: new Date() }
      ]
    });

    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 7); // 7 days from now
    const announcement4 = await Announcement.create({
      title: 'Annual Track & Field Sports Meet 2026',
      content: 'Our annual Track & Field school-wide sports meet is scheduled for **May 28, 2026** at the central stadium. Track events will begin at 9:00 AM. Register for races and relays with the PE department before Wednesday.',
      author: teacher2._id,
      category: sports._id,
      targetAudience: 'all',
      eventDate: eventDate,
      commentsEnabled: true,
      publishAt: new Date()
    });

    const announcement5 = await Announcement.create({
      title: 'Official Announcement of Summer Holidays',
      content: 'Summer term break will begin on Friday, **June 19, 2026** and school will resume for the Fall session on Monday, **September 7, 2026**. Have a fantastic summer break!',
      author: admin._id,
      category: holidays._id,
      targetAudience: 'all',
      publishAt: new Date()
    });

    // Seed an expired announcement (for archive testing)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1);
    await Announcement.create({
      title: 'Past Event: Parents-Teacher Association (PTA) Meetup',
      content: 'Please join us for the monthly PTA meeting to discuss grading structures.',
      author: admin._id,
      category: academics._id,
      targetAudience: 'all',
      publishAt: pastDate,
      expiresAt: expiredDate
    });

    console.log('Seeded 6 sample announcements (with targets, attachments, events, signatures, views).');

    // 4. Seed Comments
    await Comment.create({
      announcement: announcement1._id,
      author: student1._id,
      content: 'Will attendance be mandatory for tomorrow’s virtual lectures?'
    });

    await Comment.create({
      announcement: announcement1._id,
      author: teacher1._id,
      content: 'Yes, Alex. Standard attendance will be recorded during the virtual meet sessions.'
    });

    await Comment.create({
      announcement: announcement1._id,
      author: parent1._id,
      content: 'Thank you for prioritizing student safety in this winter storm!'
    });

    console.log('Seeded 3 comments under the snow closure announcement.');

    // 5. Seed Audit Logs
    await AuditLog.create({
      user: admin._id,
      action: 'SYSTEM_INITIALIZATION',
      description: 'System database successfully seeded with initial structural parameters.'
    });

    console.log('Seeded audit log entries.');
    console.log('Database seeding successfully completed! Ready to run.');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
