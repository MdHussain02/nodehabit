# 🔥 Firebase Setup Guide for NodeHabit

## 📋 Step-by-Step Setup

### Step 1: Get Service Account Key

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `habithero-31e24`

2. **Generate Service Account Key**
   - Click **Project Settings** (gear icon)
   - Go to **Service Accounts** tab
   - Click **"Generate new private key"**
   - Download the JSON file

3. **Save the JSON file**
   - Save it as `firebase-service-account.json` in your project root
   - **Keep this file secure** - it contains sensitive credentials

### Step 2: Create .env File

Create a `.env` file in your project root with this content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/nodehabit

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Server Configuration
NODE_ENV=development
PORT=5000

# Gemini Configuration (Required for AI-powered suggestions)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration (Required for push notifications)
FIREBASE_PROJECT_ID=habithero-31e24
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"habithero-31e24","private_key_id":"YOUR_ACTUAL_PRIVATE_KEY_ID","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_CONTENT\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@habithero-31e24.iam.gserviceaccount.com","client_id":"YOUR_ACTUAL_CLIENT_ID","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40habithero-31e24.iam.gserviceaccount.com"}
```

### Step 3: Replace Placeholder Values

1. **Open the downloaded JSON file**
2. **Copy the entire JSON content**
3. **Replace the FIREBASE_SERVICE_ACCOUNT_KEY value** in your `.env` file

Example of what the JSON looks like:
```json
{
  "type": "service_account",
  "project_id": "habithero-31e24",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@habithero-31e24.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40habithero-31e24.iam.gserviceaccount.com"
}
```

### Step 4: Install Dependencies

```bash
npm install firebase-admin node-cron
```

### Step 5: Test the Setup

```bash
# Start the server
npm run dev

# In another terminal, test notifications
curl -X POST http://localhost:5000/api/v1/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## 🔧 For React Native App

Use the configuration you provided in your React Native app:

```javascript
// react-native-firebase-config.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBbbBnRXe40Kkaqa4-xMRFuRtQPVjmtkEc",
  authDomain: "habithero-31e24.firebaseapp.com",
  projectId: "habithero-31e24",
  storageBucket: "habithero-31e24.firebasestorage.app",
  messagingSenderId: "643942362110",
  appId: "1:643942362110:web:a93bdb2b8889dbc96c2eaf",
  measurementId: "G-3CLK6C2WC1"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { app, messaging };
```

## 🧪 Quick Test

After setup, test with this curl command:

```bash
# First, register a test FCM token
curl -X POST http://localhost:5000/api/v1/notifications/token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fcmToken": "test_token_123"}'

# Then send a test notification
curl -X POST http://localhost:5000/api/v1/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🆘 Troubleshooting

### Common Issues:

1. **"Firebase initialization failed"**
   - Check that FIREBASE_SERVICE_ACCOUNT_KEY is properly set
   - Verify the JSON is valid (no extra quotes or escaping)

2. **"Service account file is invalid"**
   - Make sure you copied the entire JSON content
   - Check that the project_id matches "habithero-31e24"

3. **"Project not found"**
   - Verify your Firebase project ID is correct
   - Make sure you have access to the project

### Debug Commands:

```bash
# Check if .env file exists
ls -la .env

# Check Firebase configuration
node -e "console.log(process.env.FIREBASE_PROJECT_ID)"

# Test Firebase connection
node -e "const { initializeFirebase } = require('./src/config/firebase'); initializeFirebase();"
```

## ✅ Success Indicators

When setup is successful, you should see:
- ✅ "Firebase Admin SDK initialized successfully" in server logs
- ✅ "Scheduled notifications initialized successfully" in server logs
- ✅ Test notification endpoint returns success
- ✅ No Firebase-related errors in console

## 📚 Next Steps

1. **Test the notification system** using the provided endpoints
2. **Integrate with React Native** using the configuration provided
3. **Customize notification messages** in `src/services/notificationService.js`
4. **Monitor notifications** in Firebase Console

## 🔒 Security Notes

- **Never commit** the service account JSON to version control
- **Keep the .env file** in your .gitignore
- **Rotate service account keys** periodically
- **Use environment variables** in production 