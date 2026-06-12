const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, optionalAuth } = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

// Multer config - store in memory as buffer
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

// GET /api/reports/user/me - Get current user's reports
// IMPORTANT: This must be defined BEFORE /:id to avoid 'user' matching as an :id param
router.get('/user/me', authenticate, async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { authorId: req.user.uid },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const reportsWithoutImageData = reports.map(({ imageData, ...rest }) => ({
      ...rest,
      hasImage: !!imageData,
    }));

    res.json(reportsWithoutImageData);
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({ error: 'Failed to fetch user reports' });
  }
});

// GET /api/reports - List all active reports
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, status, lat, lng, radius, query } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    } else {
      where.status = 'ACTIVE'; // Default to active only
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (query) {
      where.title = { contains: query, mode: 'insensitive' };
    }

    let reports = await prisma.report.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Apply geo filter if coordinates provided
    if (lat && lng && radius) {
      const centerLat = parseFloat(lat);
      const centerLng = parseFloat(lng);
      const maxDistance = parseFloat(radius); // in km

      reports = reports.filter((report) => {
        const distance = getDistanceKm(
          centerLat,
          centerLng,
          report.latitude,
          report.longitude
        );
        return distance <= maxDistance;
      });
    }

    // Strip binary imageData from list response (return flag instead)
    const reportsWithoutImageData = reports.map(({ imageData, ...rest }) => ({
      ...rest,
      hasImage: !!imageData,
    }));

    res.json(reportsWithoutImageData);
  } catch (error) {
    console.error('List reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/reports/:id - Get single report with details
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Strip binary data, return hasImage flag
    const { imageData, ...rest } = report;
    res.json({ ...rest, hasImage: !!imageData });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// GET /api/reports/:id/image - Serve the image as binary
router.get('/:id/image', async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      select: { imageData: true },
    });

    if (!report || !report.imageData) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Detect image type from magic bytes
    const buffer = Buffer.from(report.imageData);
    let contentType = 'image/jpeg'; // default

    if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      contentType = 'image/png';
    } else if (buffer[0] === 0x47 && buffer[1] === 0x49) {
      contentType = 'image/gif';
    } else if (buffer[0] === 0x52 && buffer[1] === 0x49) {
      contentType = 'image/webp';
    }

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (error) {
    console.error('Serve image error:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// POST /api/reports - Create new report
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, latitude, longitude } = req.body;

    // Validation
    if (!title || !description || !category || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const validCategories = ['PETS', 'ELECTRONICS', 'KEYS', 'WALLET', 'BAG', 'OTHER'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const report = await prisma.report.create({
      data: {
        title,
        description,
        category,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        imageData: req.file ? req.file.buffer : null,
        authorId: req.user.uid,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    const { imageData, ...rest } = report;
    res.status(201).json({ ...rest, hasImage: !!imageData });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// PATCH /api/reports/:id/status - Update report status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['ACTIVE', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify ownership
    const existing = await prisma.report.findUnique({
      where: { id: req.params.id },
      select: { authorId: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (existing.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Only the report creator can change status' });
    }

    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    const { imageData, ...rest } = report;
    res.json({ ...rest, hasImage: !!imageData });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ error: 'Failed to update report status' });
  }
});

// PATCH /api/reports/:id - Edit a report (owner only)
router.patch('/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, latitude, longitude } = req.body;

    // Verify ownership
    const existing = await prisma.report.findUnique({
      where: { id: req.params.id },
      select: { authorId: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (existing.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Only the report creator can edit' });
    }

    const validCategories = ['PETS', 'ELECTRONICS', 'KEYS', 'WALLET', 'BAG', 'OTHER'];
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category && validCategories.includes(category)) updateData.category = category;
    if (latitude) updateData.latitude = parseFloat(latitude);
    if (longitude) updateData.longitude = parseFloat(longitude);
    if (req.file) updateData.imageData = req.file.buffer;

    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, email: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const { imageData, ...rest } = report;
    res.json({ ...rest, hasImage: !!imageData });
  } catch (error) {
    console.error('Edit report error:', error);
    res.status(500).json({ error: 'Failed to edit report' });
  }
});

// DELETE /api/reports/:id - Delete a report
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.report.findUnique({
      where: { id: req.params.id },
      select: { authorId: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (existing.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Only the report creator can delete' });
    }

    // Delete comments first, then report
    await prisma.comment.deleteMany({ where: { reportId: req.params.id } });
    await prisma.report.delete({ where: { id: req.params.id } });

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Note: /user/me route is defined above /:id routes to prevent parameter matching conflicts

/**
 * Haversine formula to calculate distance between two points in kilometers
 */
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = router;
