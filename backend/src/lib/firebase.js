const admin = require('firebase-admin');

const { initializeApp, getApps, cert } = require('firebase-admin/app');

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

module.exports = admin;
