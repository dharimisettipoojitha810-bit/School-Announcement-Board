const commentRepository = require('../repositories/commentRepository');
const announcementRepository = require('../repositories/announcementRepository');
const auditLogRepository = require('../repositories/auditLogRepository');

class CommentService {
  async createComment(commentData, userId, ipAddress = '') {
    const { announcementId, content } = commentData;

    const announcement = await announcementRepository.findById(announcementId);
    if (!announcement) throw new Error('Announcement not found');
    if (!announcement.commentsEnabled) throw new Error('Comments are disabled for this announcement');

    const comment = await commentRepository.create({
      announcement: announcementId,
      author: userId,
      content
    });

    await auditLogRepository.log(
      userId,
      'POST_COMMENT',
      `Posted a comment on announcement '${announcement.title}'.`,
      ipAddress
    );

    return comment;
  }

  async getCommentsByAnnouncement(announcementId) {
    return await commentRepository.findByAnnouncement(announcementId);
  }

  async deleteComment(id, userId, role, ipAddress = '') {
    const comment = await commentRepository.findById(id);
    if (!comment) throw new Error('Comment not found');

    const announcement = await announcementRepository.findById(comment.announcement);

    // Permission checks:
    // 1. Admin can delete any comment.
    // 2. Author of the comment can delete their comment.
    // 3. Author of the announcement (teacher) can delete any comment on their post.
    const isCommentAuthor = comment.author._id.toString() === userId.toString();
    const isAnnouncementAuthor = announcement && announcement.author._id.toString() === userId.toString();
    const isAdmin = role === 'admin';

    if (!isAdmin && !isCommentAuthor && !isAnnouncementAuthor) {
      throw new Error('Unauthorized to delete this comment');
    }

    await commentRepository.delete(id);

    await auditLogRepository.log(
      userId,
      'DELETE_COMMENT',
      `Deleted comment on announcement '${announcement ? announcement.title : 'Deleted Post'}'.`,
      ipAddress
    );

    return comment;
  }
}

module.exports = new CommentService();
