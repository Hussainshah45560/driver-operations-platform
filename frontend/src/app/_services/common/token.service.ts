import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  }
  public set token(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('accessToken', token);
    }
  }
  public get token(): string {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('accessToken');
      if(token != null) {
        return token;
      }
    }
    return '';
  }

}
