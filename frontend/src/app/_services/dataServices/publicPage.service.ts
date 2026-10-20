import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../core/modals';


@Injectable({
  providedIn: 'root',
})
export class PublicPageService {
  constructor(private http: HttpClient) { }

  getPublicPageByCode(params: any) {
    return this.http.get<{ success: boolean, data: Page }>(environment.api + 'public-page', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }
 


}
