const announcementRepository = require('../repositories/announcementRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const commentRepository = require('../repositories/commentRepository');

class AnnouncementService {
  async createAnnouncement(announcementData, userId, role, ipAddress = '') {
    if (role !== 'admin' && role !== 'teacher') {
      throw new Error('Unauthorized: Only administrators and teachers can publish announcements.');
    }

    const data = {
      ...announcementData,
      author: userId,
      publishAt: announcementData.publishAt || new Date()
    };

    const announcement = await announcementRepository.create(data);

    await auditLogRepository.log(
      userId,
      'CREATE_ANNOUNCEMENT',
      `Announcement '${announcement.title}' published (Audience: ${announcement.targetAudience}).`,
      ipAddress
    );

    return announcement;
  }

  async getAnnouncementDetails(id, userId, userRole) {
    const announcement = await announcementRepository.findById(id);
    if (!announcement) throw new Error('Announcement not found');

    // Increment view / Read receipt tracking
    await announcementRepository.addView(id, userId);

    return await announcementRepository.findById(id);
  }

  async getFeedForUser(user) {
    const now = new Date();
    const filters = {
      publishAt: { $lte: now },
      isArchived: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    };

    // Role-based targeting logic
    if (user.role === 'student' || user.role === 'parent') {
      filters.$and = [
        {
          $or: [
            { targetAudience: 'all' },
            { $and: [{ targetAudience: 'grade' }, { targetValue: user.gradeLevel }] },
            { $and: [{ targetAudience: 'class' }, { targetValue: { $in: user.classes || [] } }] }
          ]
        }
      ];
    }

    return await announcementRepository.findAll(filters);
  }

  async getCalendarEvents(user) {
    const filters = {
      eventDate: { $exists: true, $ne: null },
      isArchived: false
    };

    if (user.role === 'student' || user.role === 'parent') {
      filters.$and = [
        {
          $or: [
            { targetAudience: 'all' },
            { $and: [{ targetAudience: 'grade' }, { targetValue: user.gradeLevel }] },
            { $and: [{ targetAudience: 'class' }, { targetValue: { $in: user.classes || [] } }] }
          ]
        }
      ];
    }

    return await announcementRepository.findAll(filters);
  }

  async getArchivedFeed(user) {
    const now = new Date();
    const filters = {
      $or: [
        { isArchived: true },
        { expiresAt: { $lte: now } }
      ]
    };

    if (user.role === 'student' || user.role === 'parent') {
      filters.$and = [
        {
          $or: [
            { targetAudience: 'all' },
            { $and: [{ targetAudience: 'grade' }, { targetValue: user.gradeLevel }] },
            { $and: [{ targetAudience: 'class' }, { targetValue: { $in: user.classes || [] } }] }
          ]
        }
      ];
    }

    return await announcementRepository.findAllWithExpired(filters);
  }

  async updateAnnouncement(id, updateData, userId, role, ipAddress = '') {
    const announcement = await announcementRepository.findById(id);
    if (!announcement) throw new Error('Announcement not found');

    // Only creator or admin can update
    if (role !== 'admin' && announcement.author._id.toString() !== userId.toString()) {
      throw new Error('Unauthorized to update this announcement');
    }

    const updated = await announcementRepository.update(id, updateData);

    await auditLogRepository.log(
      userId,
      'UPDATE_ANNOUNCEMENT',
      `Announcement '${announcement.title}' updated.`,
      ipAddress
    );

    return updated;
  }

  async deleteAnnouncement(id, userId, role, ipAddress = '') {
    const announcement = await announcementRepository.findById(id);
    if (!announcement) throw new Error('Announcement not found');

    // Only creator or admin can delete
    if (role !== 'admin' && announcement.author._id.toString() !== userId.toString()) {
      throw new Error('Unauthorized to delete this announcement');
    }

    await announcementRepository.delete(id);
    await commentRepository.deleteByAnnouncement(id);

    await auditLogRepository.log(
      userId,
      'DELETE_ANNOUNCEMENT',
      `Announcement '${announcement.title}' deleted.`,
      ipAddress
    );

    return announcement;
  }

  async signConsent(id, userId, signatureText, ipAddress = '') {
    const announcement = await announcementRepository.findById(id);
    if (!announcement) throw new Error('Announcement not found');
    if (!announcement.signatureRequired) throw new Error('Signature not required for this announcement');

    const updated = await announcementRepository.addSignature(id, userId, signatureText);

    await auditLogRepository.log(
      userId,
      'SUBMIT_SIGNATURE',
      `Submitted digital consent signature on announcement '${announcement.title}'.`,
      ipAddress
    );

    return updated;
  }

  async toggleBookmark(id, userId) {
    return await announcementRepository.toggleBookmark(id, userId);
  }

  async getBookmarkedFeed(userId) {
    return await announcementRepository.findAll({ bookmarks: userId });
  }

  async getAnalytics(userId, role) {
    // Only teacher or admin can view engagement analytics
    if (role !== 'admin' && role !== 'teacher') {
      throw new Error('Unauthorized');
    }

    const filter = {};
    if (role === 'teacher') {
      filter.author = userId;
    }

    const announcements = await announcementRepository.findAllWithExpired(filter);
    
    // Compute simple engagement metrics
    const stats = announcements.map(a => ({
      title: a.title,
      viewsCount: a.views.length,
      signaturesCount: a.signatures.length,
      signatureRequired: a.signatureRequired,
      publishAt: a.publishAt,
      priority: a.priority
    }));

    return stats;
  }
}

module.exports = new AnnouncementService();
