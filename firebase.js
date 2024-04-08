const firebase = require("firebase/app");
const firebaseStorage = require("firebase/storage");

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

// Initialize firebase
const firebase_app = firebase.initializeApp(firebaseConfig);

const storage = firebaseStorage.getStorage(firebase_app);
const storageRef = firebaseStorage.ref();

module.exports = firebase_app;
