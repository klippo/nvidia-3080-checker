import autobind from 'autobind-decorator';
import { html, render } from 'lit-html';
import { Nvidia, ProductEntity } from './nvidia';
import { PushNotifications } from './PushNotification';

class App {
	//#region Properties
	private storesSelect: HTMLSelectElement = document.querySelector('.store select');
	private url: string = this.buildAPIUrl();
	private storeUrl: string = `https://www.nvidia.com/${this.getCountry()}/geforce/graphics-cards/30-series/rtx-3080/`;
	private interval: number = 15;
	private currentTimer: number = 0;
	private remainingElement: HTMLElement = document.querySelector('.badge-remaining');
	private statusElement: HTMLElement = document.querySelector('.badge-status');
	private currentStatus: string;
	private canNotify: boolean;
	private playSoundInput: HTMLInputElement = document.querySelector('#playSound');
	private audio: HTMLAudioElement = document.querySelector('audio');
	private testNotificationBtn: HTMLElement = document.querySelector('[test-notification]');
	private scans: Scan[] = [];
	private maxScansHolder: HTMLElement = document.querySelector('.list-group__last');
	private maxScansInMemory: number = 30;
	//#endregion

	//#region Lit HTML
	private scanTemplate = (scan: Scan) => html`
		<li class="list-group-item d-flex justify-content-between align-items-center">
			${scan.timestamp.getHours()}:${(scan.timestamp.getMinutes() < 10 ? '0' : '') +
		scan.timestamp.getMinutes()}:${(scan.timestamp.getSeconds() < 10 ? '0' : '') + scan.timestamp.getSeconds()}
				<span class="badge badge-primary badge-pill badge-status">
				${scan.status}</span>
		</li>
	`
	//#endregion

	constructor() {
		this.initNotifications();
		this.fetch().then(() => {
			this.updateRemaining();
			this.startTimers();
		});
		this.bindEvents();
	}

	private bindEvents(): void {
		this.testNotificationBtn.addEventListener('click', this.testNotifications);
		this.storesSelect.addEventListener('change', this.onStoreChange);
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

	@autobind
	private onStoreChange(): void {
		this.storeUrl = `https://www.nvidia.com/${this.getCountry()}/geforce/graphics-cards/30-series/rtx-3080/`;
		(document.querySelector('.actions > a') as HTMLAnchorElement).href = this.storeUrl;
		this.url = this.buildAPIUrl();
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

		this.addLastScan(status);
		this.currentStatus = status;

	}

	private getCountry(): string {
		const selected: string = this.storesSelect.options[this.storesSelect.selectedIndex].value;
		const country: string = selected.split(':')[0];

		return country === "no-no" ? "nb-no" : country;
	}

	private buildAPIUrl(): string {
		const selected: string = this.storesSelect.options[this.storesSelect.selectedIndex].value;
		const storeArr: string[] = selected.split(':');
		const locale: string = storeArr[0].replace('-', '_');
		const currency: string = storeArr[1];
		const id: string = storeArr[2];
		return `https://api-prod.nvidia.com/direct-sales-shop/DR/products/${locale === "de_at" ? "de_de" : locale}/${currency}/${id}`;
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

	private addLastScan(status: string) {
		const now: Date = new Date();
		const scanObj: Scan = {
			timestamp: now,
			status
		};

		this.scans.unshift(scanObj);
		if (this.scans.length > this.maxScansInMemory)
			this.scans.pop();

		this.renderLastScans();
	}

	private renderLastScans(): void {
		const template = (scans: Scan[]) => html`
			${scans.map(scan => this.scanTemplate(scan))}
		`;
		render(template(this.scans), this.maxScansHolder);
	}
}

new App();

interface Scan {
	timestamp: Date;
	status: string;
}