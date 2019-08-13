import {client} from "../client/client";

class Notifications {
  constructor() {
    this.user = client.user;
    client.subscribe({onUser: this.onUser});
  }

  onUser = user => {
    this.user = user;
  };

  async requestPermission() {
    if (window.Notification && window.Notification.permission !== 'denied') {
      await window.Notification.requestPermission();
    }
  }

  async notify() {
    if (!this.user || !this.user.settings.enableNotifications) {
      return;
    }
    await this.requestPermission();
    if (window.Notification && window.Notification.permission === "granted") {
      try {
        new Notification(...arguments);
      } catch (e) {
        console.error("Could not send notification", e);
      }
    }
  }
}

const notifications = new Notifications();

export default notifications;
