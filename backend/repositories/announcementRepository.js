const Announcement = require('../models/Announcement');

class AnnouncementRepository {
  async create(announcementData) {
    const announcement = new Announcement(announcementData);
    return await announcement.save();
  }

  async findById(id) {
    return await Announcement.findById(id)
      .populate('author', 'username email role avatar')
      .populate('category')
      .populate('signatures.user', 'username email role gradeLevel')
      .populate('views.user', 'username email role');
  }

  async findAll(filters = {}) {
    const query = { isArchived: false, ...filters };
    return await Announcement.find(query)
      .populate('author', 'username email role avatar')
      .populate('category')
      .sort({ isPinned: -1, publishAt: -1 });
  }

  async findAllWithExpired(filters = {}) {
    return await Announcement.find(filters)
      .populate('author', 'username email role avatar')
      .populate('category')
      .sort({ publishAt: -1 });
  }

  async update(id, updateData) {
    return await Announcement.findByIdAndUpdate(id, updateData, { new: true })
      .populate('author', 'username email role avatar')
      .populate('category');
  }

  async delete(id) {
    return await Announcement.findByIdAndDelete(id);
  }

  async addView(id, userId) {
    // Adds a unique read receipt if not already viewed
    return await Announcement.findByIdAndUpdate(
      id,
      { $addToSet: { views: { user: userId, viewedAt: new Date() } } },
      { new: true }
    );
  }

  async addSignature(id, userId, signatureText) {
    // Adds a consent signature
    return await Announcement.findByIdAndUpdate(
      id,
      { $addToSet: { signatures: { user: userId, signatureText, signedAt: new Date() } } },
      { new: true }
    );
  }

  async toggleBookmark(id, userId) {
    const announcement = await Announcement.findById(id);
    if (!announcement) return null;

    const isBookmarked = announcement.bookmarks.includes(userId);
    if (isBookmarked) {
      announcement.bookmarks.pull(userId);
    } else {
      announcement.bookmarks.push(userId);
    }
    await announcement.save();
    return announcement;
  }
}

module.exports = new AnnouncementRepository();
