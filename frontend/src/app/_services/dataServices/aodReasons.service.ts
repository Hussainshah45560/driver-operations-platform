import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';
import { SettingData } from '../../core/modals';

@Injectable({
  providedIn: 'root',
})
export class AodReasonsService {
  constructor(private http: HttpClient) { }

  getAllAodReasons(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'aodReasons', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleAodReason(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'aodReasons/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateAodReason(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'aodReasons/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'aodReasons/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteAodReason(id: string) {
    return this.http.delete(environment.api + 'aodReasons/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
