const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Skip initialization in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log('Skipping Firebase initialization in test environment');
      return { 
        messaging: () => ({
          send: async (message) => {
            console.log('Mock FCM send called with:', message);
            return 'mock_message_id_' + Date.now();
          },
          sendMulticast: async (message) => {
            console.log('Mock FCM sendMulticast called with:', message);
            return {
              successCount: message.tokens ? message.tokens.length : 1,
              failureCount: 0,
              responses: message.tokens ? message.tokens.map(() => ({ success: true })) : [{ success: true }]
            };
          }
        })
      };
    }

    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      return admin.apps[0];
    }

    // Initialize Firebase Admin SDK
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : require(path.join(__dirname, '../../habithero-31e24-firebase-adminsdk-fbsvc-17ad84aad5.json'));

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