import autobind from 'autobind-decorator';
import { Nvidia, ProductEntity } from './nvidia';
import { PushNotifications } from './PushNotification';

class App {
	private url: string = "https://api-prod.nvidia.com/direct-sales-shop/DR/products/en_us/USD/5438481700";
	private storeUrl: string = "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3080/";
	private interval: number = 60;
	private currentTimer: number = 0;
	private remainingElement: HTMLElement = document.querySelector('.badge-remaining');
	private statusElement: HTMLElement = document.querySelector('.badge-status');
	private currentStatus: string;
	private canNotify: boolean;
	private playSoundInput: HTMLInputElement = document.querySelector('#playSound');
	private audio: HTMLAudioElement = document.querySelector('audio');
	private testNotificationBtn: HTMLElement = document.querySelector('[test-notification]');

	constructor() {
		this.initNotifications();

		this.fetch().then(() => {
			this.updateRemaining();
			this.startTimers();
		});

		this.testNotificationBtn.addEventListener('click', this.testNotifications);
	}

	private initNotifications(): void {
		if (PushNotifications.isPushNotificationSupported()) {
			PushNotifications.initializePushNotifications().then((consent: string) => {
				if (consent === 'granted') {
					this.canNotify = true;
				} else {
					this.canNotify = false;
				}
			});
		}
	}

	@autobind
	private testNotifications(): void {
		this.notify('TEST', 'TEST');
	}

	private startTimers(): void {
		window.setInterval(this.tick, 1000);
		window.setInterval(this.fetch, this.interval * 1000);
	}

	@autobind
	private tick(): void {
		this.currentTimer++;
		this.updateRemaining();
	}

	private updateRemaining(): void {
		const remaining: number = this.interval - this.currentTimer;
		if (remaining == 0) {
			this.remainingElement.innerHTML = `SCANNING`;
		} else {
			this.remainingElement.innerHTML = `${remaining}`;
		}
	}

	private updateStatus(status: string): void {
		this.statusElement.innerHTML = status;

		if (!this.currentStatus) {
			this.currentStatus = status;
		}

		if (this.currentStatus !== status) {
			this.notify(this.currentStatus, status);
		}

		this.currentStatus = status;

	}

	private convertStatus(status: string): string {
		switch (status) {
			case 'PRODUCT_INVENTORY_OUT_OF_STOCK':
				return 'Out of stock';
			case 'PRODUCT_INVENTORY_IN_STOCK':
				return 'In stock';
			default:
				return status;
		}
	}

	@autobind
	private async fetch() {
		this.currentTimer = 0;
		const nvidiaData: Nvidia = await this.getData();
		const product: ProductEntity = nvidiaData.products.product[0];
		const { status } = product.inventoryStatus;

		if (status) {
			this.updateStatus(this.convertStatus(status));
		}
	}

	private async getData(): Promise<Nvidia> {
		const data = await fetch(this.url);
		const json = await data.json();

		if (data.status === 200) {
			return json;
		}
	}

	private notify(oldStatus: string, newStatus: string): void {
		if (this.canNotify) {
			const text: string = `Stock went from ${oldStatus} to ${newStatus}.`;
			const notification: Notification = PushNotifications.sendNotification('NVIDIA 3080FE Stock alert', { body: text });
			notification.addEventListener('click', this.onNotificationClicked);
		}

		if (this.playSoundInput.checked)
			this.chime();
	}

	@autobind
	private onNotificationClicked(): void {
		window.open(this.storeUrl, '_blank');
	}

	private chime(): void {
		this.audio.currentTime = 0;
		this.audio.volume = 1;
		this.audio.play();
	}
}

new App();