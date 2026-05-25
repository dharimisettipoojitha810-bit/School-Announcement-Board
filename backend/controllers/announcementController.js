const announcementService = require('../services/announcementService');

class AnnouncementController {
  async create(req, res, next) {
    try {
      const {
        title,
        content,
        category,
        targetAudience,
        targetValue,
        priority,
        isPinned,
        publishAt,
        expiresAt,
        eventDate,
        signatureRequired,
        commentsEnabled
      } = req.body;

      // Handle file attachments uploaded via multer
      const attachments = [];
      if (req.files) {
        req.files.forEach(file => {
          attachments.push({
            name: file.originalname,
            path: `/uploads/${file.filename}`
          });
        });
      }

      const announcementData = {
        title,
        content,
        category,
        targetAudience,
        targetValue,
        priority,
        isPinned: isPinned === 'true' || isPinned === true,
        publishAt: publishAt ? new Date(publishAt) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        signatureRequired: signatureRequired === 'true' || signatureRequired === true,
        commentsEnabled: commentsEnabled !== 'false' && commentsEnabled !== false,
        attachments
      };

      const announcement = await announcementService.createAnnouncement(
        announcementData,
        req.user._id,
        req.user.role,
        req.ip
      );

      res.status(201).json({ success: true, data: announcement });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getFeed(req, res, next) {
    try {
      const feed = await announcementService.getFeedForUser(req.user);
      res.status(200).json({ success: true, data: feed });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getCalendar(req, res, next) {
    try {
      const events = await announcementService.getCalendarEvents(req.user);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getArchive(req, res, next) {
    try {
      const archive = await announcementService.getArchivedFeed(req.user);
      res.status(200).json({ success: true, data: archive });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDetails(req, res, next) {
    try {
      const details = await announcementService.getAnnouncementDetails(
        req.params.id,
        req.user._id,
        req.user.role
      );
      res.status(200).json({ success: true, data: details });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async update(req, res, next) {
    try {
      const updateData = { ...req.body };
      if (updateData.isPinned) updateData.isPinned = updateData.isPinned === 'true' || updateData.isPinned === true;
      if (updateData.signatureRequired) updateData.signatureRequired = updateData.signatureRequired === 'true' || updateData.signatureRequired === true;
      if (updateData.commentsEnabled) updateData.commentsEnabled = updateData.commentsEnabled !== 'false' && updateData.commentsEnabled !== false;

      // Handle additional uploads if any
      if (req.files && req.files.length > 0) {
        const newAttachments = req.files.map(file => ({
          name: file.originalname,
          path: `/uploads/${file.filename}`
        }));
        updateData.attachments = newAttachments;
      }

      const announcement = await announcementService.updateAnnouncement(
        req.params.id,
        updateData,
        req.user._id,
        req.user.role,
        req.ip
      );
      res.status(200).json({ success: true, data: announcement });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res, next) {
    try {
      const announcement = await announcementService.deleteAnnouncement(
        req.params.id,
        req.user._id,
        req.user.role,
        req.ip
      );
      res.status(200).json({ success: true, message: 'Announcement deleted successfully', data: announcement });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async signConsent(req, res, next) {
    try {
      const { signatureText } = req.body;
      if (!signatureText) {
        return res.status(400).json({ success: false, message: 'Signature text is required for consent sign-off' });
      }
      const announcement = await announcementService.signConsent(
        req.params.id,
        req.user._id,
        signatureText,
        req.ip
      );
      res.status(200).json({ success: true, data: announcement });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async toggleBookmark(req, res, next) {
    try {
      const result = await announcementService.toggleBookmark(req.params.id, req.user._id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getBookmarks(req, res, next) {
    try {
      const bookmarks = await announcementService.getBookmarkedFeed(req.user._id);
      res.status(200).json({ success: true, data: bookmarks });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const stats = await announcementService.getAnalytics(req.user._id, req.user.role);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(403).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AnnouncementController();
