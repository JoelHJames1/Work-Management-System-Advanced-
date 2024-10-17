importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAosY9XOqxE1n1hxY2iP_KBIwLiwUf8nSs',
  authDomain: 'workmanagement-a6b1e.firebaseapp.com',
  projectId: 'workmanagement-a6b1e',
  storageBucket: 'workmanagement-a6b1e.appspot.com',
  messagingSenderId: '568635570670',
  appId: '1:568635570670:web:6156e0e9eb743c9da1b6ff',
  measurementId: 'G-1KRFHKR3C1',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});