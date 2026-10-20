import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';

import { Router } from '@angular/router';
import { TokenService } from '../../_services/common/token.service';
import { LoadingService } from '../../_services/common/loading.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private toastr: ToastrService,
    private tokenService: TokenService,
    private router: Router,
    private loading: LoadingService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap((evt: any) => {
        if (evt.body) {
          this.loading.end();
          if (evt.body.token) {
            this.tokenService.token = evt.body.token;
            // this._auth.updateUser();
          }
          if (evt.body.success == true && evt.body.message) {
            this.toastr.success(
              this.toSentenceCase(evt.body.message),
              'Success'
            );
          }
        }
      }),
      catchError((res) => {
        console.log(res)
        this.loading.end();
        let error = res.error?.message || res.statusText;
        let r = '';
        if (res.status === 401) {
          // Auto logout if 401 response returned from API
          this.router.navigateByUrl('/');
        }

        if (res.status === 400) {
          // 🟢 Case 1: Zod-style errors (array of { field, message })
          if (Array.isArray(res.error.errors)) {
            res.error.errors.forEach((err: any) => {
             
              r +=`<p>${err.field.charAt(0).toUpperCase() + err.field.slice(1)}: ${
                err.message
              }</p>`;
            });
          }
          // 🟢 Case 2: Laravel-style or backend object errors
          else if (typeof res.error.errors === 'object') {
            Object.keys(res.error.errors).forEach((field) => {
              const e = res.error.error[field];
              r += `<p>${field.charAt(0).toUpperCase() + field.slice(1)}: ${
                e[0]
              }</p>`;
            });
          }
          // 🟢 Case 3: Plain message string
          else {
            r = `<p>${res.error.message || 'Invalid request'}</p>`;
          }
        }

        // 🟢 Fallback: If still nothing, show plain error message
        if (r) {
          console.log(r)
          this.toastr.error(r, 'Error', { enableHtml: true });
        } else {
          this.toastr.error(error, 'Error');
        }
        return throwError(() => res);
      })
    );
  }

  toSentenceCase(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
