export class NotificationManager {
  static async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static show(title, options = {}) {
    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    notification.onclose = () => {
      console.log('Notification closed');
    };

    return notification;
  }

  static showTimerComplete() {
    return this.show('🎯 Focus Mode - Timer Selesai', {
      body: 'Waktu fokus Anda telah habis! Saatnya untuk istirahat sejenak.',
      tag: 'timer-complete',
      requireInteraction: true,
    });
  }

  static showBreakComplete() {
    return this.show('⏰ Focus Mode - Istirahat Selesai', {
      body: 'Waktu istirahat telah habis! Kembali fokus untuk sesi berikutnya.',
      tag: 'break-complete',
      requireInteraction: true,
    });
  }

  static showSessionReminder(sessionTitle) {
    return this.show('📚 Focus Mode - Pengingat Sesi', {
      body: `Sesi "${sessionTitle}" akan segera dimulai. Siapkan diri Anda!`,
      tag: 'session-reminder',
    });
  }

  static showAchievement(title, message) {
    return this.show('🏆 ' + title, {
      body: message,
      tag: 'achievement',
      icon: '/icons/icon-512x512.png',
    });
  }

  static showOfflineReady() {
    return this.show('📱 Focus Mode - Siap Offline', {
      body: 'Aplikasi telah siap digunakan dalam mode offline!',
      tag: 'offline-ready',
    });
  }

  static showDataSynced() {
    return this.show('🔄 Focus Mode - Data Disinkronisasi', {
      body: 'Data Anda telah berhasil disinkronisasi dengan server.',
      tag: 'data-synced',
    });
  }
}