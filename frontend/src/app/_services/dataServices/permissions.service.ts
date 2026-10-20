import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';



@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  constructor(private http: HttpClient) { }

  getAllPermissions(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: any }>(environment.api + 'permissions/all-permissions/fetch', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }
}
