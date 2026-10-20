import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DisputeType } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DisputeTypesService {
  constructor(private http: HttpClient) {}

  getAllDisputeTypes(params: Params) {
    return this.http
      .get<{
        success: boolean;
        pagination: Pagination;
        data: DisputeType[];
      }>(environment.api + 'disputeTypes', { params: params })
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }
  getSingleDisputeType(id: string) {
    return this.http
      .get<{
        success: boolean;
        data: DisputeType;
      }>(environment.api + 'disputeTypes/' + id)
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }

  createOrUpdateDisputeType(data: DisputeType, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'disputeTypes/' + id, data).pipe(
        map((res) => {
          return res;
        }),
      );
    } else {
      return this.http
        .post<{
          success: boolean;
          data: any;
        }>(environment.api + 'disputeTypes/', data)
        .pipe(
          map((res) => {
            return res;
          }),
        );
    }
  }

  deleteDisputeType(id: string) {
    return this.http.delete(environment.api + 'disputeTypes/' + id).pipe(
      map((res) => {
        return res;
      }),
    );
  }
}
