const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      return admin.apps[0];
    }

    // Initialize Firebase Admin SDK
    // You'll need to download your Firebase service account key and place it in the config folder
    // or set the GOOGLE_APPLICATION_CREDENTIALS environment variable
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : require(path.join(__dirname, '../../firebase-service-account.json'));

    const firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id'
    });

    console.log('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

// Get Firebase Admin instance
const getFirebaseAdmin = () => {
  if (admin.apps.length === 0) {
    return initializeFirebase();
  }
  return admin.apps[0];
};

// Get FCM messaging instance
const getMessaging = () => {
  const app = getFirebaseAdmin();
  return app.messaging();
};

module.exports = {
  initializeFirebase,
  getFirebaseAdmin,
  getMessaging
}; 