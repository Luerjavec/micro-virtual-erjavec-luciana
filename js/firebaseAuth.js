console.log("firebase")

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Import the functions you need from the SDKs you need

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js"

import { } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js"

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBg63KTB7Hg-1qlRTY7V6X-lQLq6DJd0-E",
    authDomain: "microscopio-virtual.firebaseapp.com",
    projectId: "microscopio-virtual",
    storageBucket: "microscopio-virtual.appspot.com",
    messagingSenderId: "822154127482",
    appId: "1:822154127482:web:c749af1e13ffb66929f3c3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);