import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';


@Injectable({
	providedIn: 'root'
})
export class PermissionService {
	constructor(private authService: AuthService) {
	}
	public havePerm(component: string, permission: string): boolean {
		let user = this.authService.userDetails;
		if (user && user.role?.permissions[component] && user.role?.permissions[component][permission]) {
			return true;

		}
		return false;
	}
}
