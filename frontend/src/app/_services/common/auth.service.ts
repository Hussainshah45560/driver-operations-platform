import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Params, Router } from '@angular/router';
import { TokenService } from './token.service';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';
import { Navigation, User } from '../../core/modals';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private checkLogin = new BehaviorSubject<boolean>(false);
  loginOB = this.checkLogin.asObservable();
  private user = new BehaviorSubject<User | null>(null);
  userInfo = this.user.asObservable();
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private jwtHelper: JwtHelperService, private router: Router, private tokenService: TokenService) {
  }
  public login(email: string, phoneNumber: number, password: string) {
    return this.http.post<{ success: boolean, error: boolean, accessToken?: string, message: string, refreshToken: string, data: { navigation: Navigation } }>(environment.api + 'auth/login', { email, phoneNumber, password })
      .pipe(map(res => {
        if (res && res.accessToken) {
          // console.log(res);
          this.tokenService.token = res.accessToken;
          this.isLoggedIn;
          this.updateUser();
        }
        return res;
      }));
  }

  public forgotPassword(phoneNumber: string, email: string) {
    return this.http.post(environment.api + 'auth/forgetPassword', { phoneNumber: phoneNumber, email: email }).pipe(map(res => {
      return res;
    }));
  }

  public verifyCode(phoneNumber: string, email: string, code: number) {
    return this.http.post(environment.api + 'auth/verifyCode', { phoneNumber: phoneNumber, email: email, code: code }).pipe(map((res: any) => {
      return res;
    }));
  }

  public setNewPassword(phoneNumber: string, email: string, code: number, password: string, confirmPassword: string) {
    return this.http.post(environment.api + 'auth/setPassword', { phoneNumber: phoneNumber, email: email, code: code, password: password, passwordConfirm: confirmPassword }).pipe(map(res => {
      return res;
    }));
  }

  public createNewPassword(code: string, password: string, confirmPassword: string) {
    return this.http.post(environment.api + 'auth/createPassword', { code: code, password: password, passwordConfirm: confirmPassword }).pipe(map(res => {
      return res;
    }));
  }

  validateUrl(params: Params) {
    return this.http.get<{ success: boolean, data: any }>(environment.api + 'auth/validateLink', { params }).pipe(map((res) => {
      return res;
    })
    );
  }

  resendEmail(params: Params) {
    return this.http.get<{ success: boolean, data: any }>(environment.api + 'auth/resendEmail', { params }).pipe(map((res) => {
      return res;
    })
    );
  }

  registerUser(data: User) {
    return this.http.post(environment.api + 'auth/register', data).pipe(map((res) => {
      return res;
    })
    );
  }

  public get isLoggedIn(): boolean {
    let loggedin = !this.jwtHelper.isTokenExpired(this.tokenService.token);
    if (loggedin === false) {
      this.logout();
    }
    this.checkLogin.next(loggedin);
    return loggedin;
  }

  public get loggedIn(): boolean {
    return this.checkLogin.value;
  }

  public updateUser(): void {
    let decodeToken = this.jwtHelper.decodeToken(this.tokenService.token);
    this.user.next(decodeToken);
  }
  public get userDetails(): User | null {
    if (this.checkLogin.value === true) {
      if (this.user.value == null) {
        this.updateUser();
      }
      return this.user.value;
    } else {
      return null;
    }
  }

  logout() {
    // remove user from local storage to log user out
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('_cookiesId');
      localStorage.removeItem('navigation');
    }
    this.checkLogin.next(false);
    this.user.next(null);
    this.router.navigate(['/']);
  }
}
