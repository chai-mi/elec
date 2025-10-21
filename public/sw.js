self.addEventListener("push", (event) => {
  console.log("Received a push message", event);
  const { title, ...options } = event.data?.json();
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
});
