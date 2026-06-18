const Redis = require('ioredis');

let redis = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
  
  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });
  
  redis.on('connect', () => {
    console.log('Connected to Upstash Redis');
  });
}

const getCache = async (key) => {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis get error:', err);
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 60) => {
  if (!redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    console.error('Redis set error:', err);
  }
};

const clearCache = async (pattern) => {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error('Redis clear error:', err);
  }
};

module.exports = { redis, getCache, setCache, clearCache };
