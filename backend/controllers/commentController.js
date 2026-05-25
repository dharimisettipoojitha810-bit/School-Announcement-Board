const commentService = require('../services/commentService');

class CommentController {
  async getByAnnouncement(req, res, next) {
    try {
      const comments = await commentService.getCommentsByAnnouncement(req.params.announcementId);
      res.status(200).json({ success: true, data: comments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res, next) {
    try {
      const { announcementId, content } = req.body;
      if (!announcementId || !content) {
        return res.status(400).json({ success: false, message: 'Announcement ID and content are required' });
      }
      const comment = await commentService.createComment({ announcementId, content }, req.user._id, req.ip);
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res, next) {
    try {
      const comment = await commentService.deleteComment(req.params.id, req.user._id, req.user.role, req.ip);
      res.status(200).json({ success: true, message: 'Comment deleted successfully', data: comment });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CommentController();
