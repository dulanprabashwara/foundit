const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/users/sync - Create or update user after Firebase auth
router.post('/sync', authenticate, async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    const user = await prisma.user.upsert({
      where: { id: uid },
      update: { email, name: req.body.name || name },
      create: {
        id: uid,
        email,
        name: req.body.name || name,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('User sync error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// GET /api/users/me - Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.uid },
      include: {
        _count: {
          select: { reports: true, comments: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
