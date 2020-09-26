export class PushNotifications {
	public static isPushNotificationSupported() {
		return "serviceWorker" in navigator && "PushManager" in window;
	}

	public static initializePushNotifications() {
		// request user grant to show notification
		return Notification.requestPermission(function (result) {
			return result;
		});
	}

	public static sendNotification(title: string, data: any): Notification {
		const options = {
			vibrate: [200, 100, 200]
		};

		const notification: Notification = new Notification(title, { ...options, ...data });
		return notification;
	}
}