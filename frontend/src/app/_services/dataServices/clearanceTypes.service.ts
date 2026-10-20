import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClearanceType } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClearanceTypesService {
  constructor(private http: HttpClient) {}

  getAllClearanceTypes(params: Params) {
    return this.http
      .get<{
        success: boolean;
        pagination: Pagination;
        data: ClearanceType[];
      }>(environment.api + 'clearanceTypes', { params: params })
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }
  getSingleClearanceType(id: string) {
    return this.http
      .get<{
        success: boolean;
        data: ClearanceType;
      }>(environment.api + 'clearanceTypes/' + id)
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }

  createOrUpdateClearanceType(data: ClearanceType, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'clearanceTypes/' + id, data).pipe(
        map((res) => {
          return res;
        }),
      );
    } else {
      return this.http
        .post<{
          success: boolean;
          data: any;
        }>(environment.api + 'clearanceTypes/', data)
        .pipe(
          map((res) => {
            return res;
          }),
        );
    }
  }

  deleteClearanceType(id: string) {
    return this.http.delete(environment.api + 'clearanceTypes/' + id).pipe(
      map((res) => {
        return res;
      }),
    );
  }
}
