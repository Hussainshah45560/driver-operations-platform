import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class LoadingService {
	private _loading = new BehaviorSubject<number>(0);
	loading = this._loading.asObservable();
	private _isBrowser = new BehaviorSubject<boolean>(true);
	isBrowser = this._isBrowser.asObservable();
	constructor(@Inject(PLATFORM_ID) private platformId: Object) {
		
	}
	public start() {
		this._loading.next(this._loading.value + 1);
	}
	public end() {
		if (this._loading.value > 0) {
			this._loading.next(this._loading.value - 1);
		}
	}
	public appLoaded() {
		this._isBrowser.next(!isPlatformBrowser(this.platformId))
	}
}
