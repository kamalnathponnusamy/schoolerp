// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBaNf2K_sugGEKrMWIJTmGdcZ57EWq0TF4",
  authDomain: "schoolerp-c5a5b.firebaseapp.com",
  projectId: "schoolerp-c5a5b",
  storageBucket: "schoolerp-c5a5b.firebasestorage.app",
  messagingSenderId: "632420406403",
  appId: "1:632420406403:web:34695792adbd9bf2d377b6",
  measurementId: "G-LTGXS1MS2R"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
