// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD1kvsvjO3DLPUX4zCRh7-J8Ga8mKEFeBs",
    authDomain: "task-manager-14152.firebaseapp.com",
    projectId: "task-manager-14152",
    storageBucket: "task-manager-14152.firebasestorage.app",
    messagingSenderId: "662986316137",
    appId: "1:662986316137:web:3cf07acefe11120e6c45f8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);