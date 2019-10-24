import {client} from "../client/client";

class Notifications {
  async requestPermission() {
    if (window.Notification && window.Notification.permission !== 'denied') {
      await window.Notification.requestPermission();
    }
  }

  async notify() {
    if (!client.applicableSettings.enableNotifications) {
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
