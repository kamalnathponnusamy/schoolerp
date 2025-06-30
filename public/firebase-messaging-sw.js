/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBaNf2K_sugGEKrMWIJTmGdcZ57EWq0TF4",
  authDomain: "schoolerp-c5a5b.firebaseapp.com",
  projectId: "schoolerp-c5a5b",
  storageBucket: "schoolerp-c5a5b.firebasestorage.app",
  messagingSenderId: "632420406403",
  appId: "1:632420406403:web:34695792adbd9bf2d377b6",
  measurementId: "G-LTGXS1MS2R"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: '/logo.png', // optional icon
  });
});
