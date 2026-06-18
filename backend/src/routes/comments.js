const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/comments - Create a comment on a report
router.post('/', authenticate, async (req, res) => {
  try {
    const { text, reportId, parentId } = req.body;

    if (!text || !reportId) {
      return res.status(400).json({ error: 'Text and reportId are required' });
    }

    // Verify report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        reportId,
        parentId: parentId || null,
        authorId: req.user.uid,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// GET /api/comments/:reportId - Get comments for a report
router.get('/:reportId', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { reportId: req.params.reportId },
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// DELETE /api/comments/:id - Delete a comment (only by author)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Only the comment author can delete' });
    }

    await prisma.comment.delete({ where: { id: req.params.id } });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;
