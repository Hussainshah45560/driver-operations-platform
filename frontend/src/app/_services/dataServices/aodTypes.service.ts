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
export class AodTypesService {
  constructor(private http: HttpClient) { }

  getAllAodTypes(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'aodTypes', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleAodType(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'aodTypes/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateAodType(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'aodTypes/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'aodTypes/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteAodType(id: string) {
    return this.http.delete(environment.api + 'aodTypes/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
