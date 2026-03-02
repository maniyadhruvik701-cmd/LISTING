// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAtCHlnDnk9iYmSdVcJlMl1w_D1gqndjas",
    authDomain: "price-c66c0.firebaseapp.com",
    databaseURL: "https://price-c66c0-default-rtdb.firebaseio.com",
    projectId: "price-c66c0",
    storageBucket: "price-c66c0.firebasestorage.app",
    messagingSenderId: "497669801071",
    appId: "1:497669801071:web:d49720d1b542a48193b99a",
    measurementId: "G-8R7SKDQ6TH"
};

// Initialize Firebase
let app;
let db;
let auth;
let analytics;

if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);
    // Use Realtime Database instead of Firestore
    db = firebase.database();
    auth = firebase.auth();
    analytics = firebase.analytics();

    // Sign in anonymously to satisfy database rules
    auth.signInAnonymously().catch((error) => {
        console.error("Error signing in anonymously:", error);
    });

    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("User signed in anonymously:", user.uid);
        } else {
            console.log("User signed out");
        }
    });

    console.log("Firebase initialized successfully (Realtime DB + Anonymous Auth)");
} else {
    console.error("Firebase SDK not loaded");
}
