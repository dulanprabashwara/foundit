const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// POST /api/users/sync - Create or update user after Firebase auth
router.post('/sync', authenticate, async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    const defaultName = email ? email.split('@')[0] : 'Unknown User';
    const finalName = req.body.name || name || defaultName;
    const finalEmail = email || `user-${uid}@foundit.local`;

    const user = await prisma.user.upsert({
      where: { id: uid },
      update: { email: finalEmail, name: finalName },
      create: {
        id: uid,
        email: finalEmail,
        name: finalName,
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

    const { photoData, ...rest } = user;
    res.json({ ...rest, hasPhoto: !!photoData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PATCH /api/users/me - Update user profile
router.patch('/me', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone; // Allow empty string to clear
    if (req.file) updateData.photoData = req.file.buffer;

    const user = await prisma.user.upsert({
      where: { id: req.user.uid },
      update: updateData,
      create: {
        id: req.user.uid,
        email: req.user.email || `user-${req.user.uid}@foundit.local`,
        name: name || req.user.name || (req.user.email ? req.user.email.split('@')[0] : 'Unknown User'),
        phone: phone || null,
        photoData: req.file ? req.file.buffer : null,
      },
    });

    const { photoData, ...rest } = user;
    res.json({ ...rest, hasPhoto: !!photoData });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: `Failed to update user: ${error.message}` });
  }
});

// GET /api/users/:id/image - Serve user profile picture
router.get('/:id/image', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { photoData: true },
    });

    if (!user || !user.photoData) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const buffer = Buffer.from(user.photoData);
    let contentType = 'image/jpeg';

    if (buffer[0] === 0x89 && buffer[1] === 0x50) contentType = 'image/png';
    else if (buffer[0] === 0x47 && buffer[1] === 0x49) contentType = 'image/gif';
    else if (buffer[0] === 0x52 && buffer[1] === 0x49) contentType = 'image/webp';

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (error) {
    console.error('Serve user image error:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

module.exports = router;
