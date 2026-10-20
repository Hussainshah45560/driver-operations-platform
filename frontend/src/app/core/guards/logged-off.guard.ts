import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../../_services/common/token.service';


@Injectable({
	providedIn: 'root'
})
export class LoggedOffGuard implements CanActivate {
	constructor(
		private router: Router,
		private _token: TokenService,
	) { }
	canActivate(): boolean {
		if (this._token.token == '') {
			return true;
		}
		this.router.navigate(['/dashboard']);
		return false;
	}
}
