import {Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../_services/common/auth.service';
import { PermissionService } from '../../_services/common/permission.service';
import { ToastrService } from 'ngx-toastr';


@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {
	constructor(
		private router: Router,
		private authservice: AuthService,
		private ps: PermissionService,
		private toastr: ToastrService
	) { }
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		if (this.authservice.isLoggedIn) {
			if (route.data && route.data['component'] && route.data['permission']) {
				if (this.ps.havePerm(route.data['component'], route.data['permission'])) {
					return true;
				} else {
					this.toastr.error('You don\'t have permission', 'Permission Error');
					this.router.navigate(['/dashboard'], { queryParams: { returnUrl: state.url.replace(/\//g, '->') } });
					return false;
				}
			}
		}
		
		// not logged in so redirect to login page with the return url
		this.router.navigate(['/login'], { queryParams: { returnUrl: state.url.replace(/\//g, '->') } });
		return false;
	}
}
