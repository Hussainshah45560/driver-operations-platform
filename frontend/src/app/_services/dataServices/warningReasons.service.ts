import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WarningReason } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class WarningReasonsService {
  constructor(private http: HttpClient) {}

  getAllWarningReasons(params: Params) {
    return this.http
      .get<{
        success: boolean;
        pagination: Pagination;
        data: WarningReason[];
      }>(environment.api + 'warningReasons', { params: params })
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }
  getSingleWarningReason(id: string) {
    return this.http
      .get<{
        success: boolean;
        data: WarningReason;
      }>(environment.api + 'warningReasons/' + id)
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }

  createOrUpdatWarningReason(data: WarningReason, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'warningReasons/' + id, data).pipe(
        map((res) => {
          return res;
        }),
      );
    } else {
      return this.http
        .post<{
          success: boolean;
          data: any;
        }>(environment.api + 'warningReasons/', data)
        .pipe(
          map((res) => {
            return res;
          }),
        );
    }
  }

  deleteWarningReason(id: string) {
    return this.http.delete(environment.api + 'warningReasons/' + id).pipe(
      map((res) => {
        return res;
      }),
    );
  }
}
