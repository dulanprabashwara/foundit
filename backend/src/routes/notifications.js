const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/notifications/check
 * Check for new reports within user's geofence
 * Body: { latitude, longitude, radiusKm, since (ISO date string) }
 */
router.post('/check', authenticate, async (req, res) => {
  try {
    const { latitude, longitude, radiusKm, since } = req.body;

    if (!latitude || !longitude || !radiusKm) {
      return res.status(400).json({ error: 'latitude, longitude, and radiusKm are required' });
    }

    const centerLat = parseFloat(latitude);
    const centerLng = parseFloat(longitude);
    const maxDistance = parseFloat(radiusKm);

    const where = {
      status: 'ACTIVE',
    };

    // If since is provided, only get reports after that date
    if (since) {
      where.createdAt = { gte: new Date(since) };
    }

    let reports = await prisma.report.findMany({
      where,
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by distance using Haversine formula
    reports = reports
      .map((report) => {
        const distance = getDistanceKm(
          centerLat,
          centerLng,
          report.latitude,
          report.longitude
        );
        const { imageData, ...rest } = report;
        return { ...rest, hasImage: !!imageData, distance: Math.round(distance * 100) / 100 };
      })
      .filter((report) => report.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    // Fetch recent comments by others on the user's reports
    const comments = await prisma.comment.findMany({
      where: {
        report: { authorId: req.user.uid },
        authorId: { not: req.user.uid },
        ...(since ? { createdAt: { gte: new Date(since) } } : {})
      },
      include: {
        report: { select: { id: true, title: true } },
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      count: reports.length + comments.length,
      reports,
      comments,
    });
  } catch (error) {
    console.error('Notification check error:', error);
    res.status(500).json({ error: 'Failed to check notifications' });
  }
});

/**
 * Haversine formula
 */
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
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
