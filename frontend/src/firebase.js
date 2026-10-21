// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAasFdCNV0pV_YlATqT3NJAl5m4K0atP3E",
    authDomain: "e-com-flutter-fef78.firebaseapp.com",
    databaseURL: "https://e-com-flutter-fef78-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "e-com-flutter-fef78",
    storageBucket: "e-com-flutter-fef78.firebasestorage.app",
    messagingSenderId: "685703390929",
    appId: "1:685703390929:web:7eaa262d5d794bebb587f0",
    measurementId: "G-90Y2EE06RY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const database = getDatabase(app);