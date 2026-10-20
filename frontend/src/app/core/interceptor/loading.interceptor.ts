import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoadingService } from '../../_services/common/loading.service';



@Injectable()

export class LoadingInterceptor implements HttpInterceptor {
	constructor(private loading: LoadingService) { }
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		if(!request.params.get("noloading")) {
			this.loading.start();
		}
		return next.handle(request);
	}
}
