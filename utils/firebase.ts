// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBQR5R8JY3oSZXJJROhWhcG4Px4Ue43_Cw",
    authDomain: "easymeal-e280d.firebaseapp.com",
    databaseURL: "https://easymeal-e280d-default-rtdb.firebaseio.com",
    projectId: "easymeal-e280d",
    storageBucket: "easymeal-e280d.firebasestorage.app",
    messagingSenderId: "634042746356",
    appId: "1:634042746356:web:9cc00d26d905bbda4fa5a1",
    measurementId: "G-6X2FZHZ8LJ"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);