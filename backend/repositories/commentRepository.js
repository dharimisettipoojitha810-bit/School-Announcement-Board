const Comment = require('../models/Comment');

class CommentRepository {
  async create(commentData) {
    const comment = new Comment(commentData);
    const saved = await comment.save();
    return await saved.populate('author', 'username email role avatar');
  }

  async findByAnnouncement(announcementId) {
    return await Comment.find({ announcement: announcementId })
      .populate('author', 'username email role avatar')
      .sort({ createdAt: 1 });
  }

  async findById(id) {
    return await Comment.findById(id).populate('author', 'username email role avatar');
  }

  async delete(id) {
    return await Comment.findByIdAndDelete(id);
  }

  async deleteByAnnouncement(announcementId) {
    return await Comment.deleteMany({ announcement: announcementId });
  }
}

module.exports = new CommentRepository();
