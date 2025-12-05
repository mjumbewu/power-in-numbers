import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBFr-PDbjWfbT7wcbZLs2xUstp4HC9n8Gk",
    authDomain: "power-in-numbers-prototype.firebaseapp.com",
    projectId: "power-in-numbers-prototype",
    storageBucket: "power-in-numbers-prototype.firebasestorage.app",
    messagingSenderId: "306848320804",
    appId: "1:306848320804:web:329a77dff62a2beab277b1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
