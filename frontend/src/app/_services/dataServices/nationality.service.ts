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
export class NationalityService {
  constructor(private http: HttpClient) { }

  getAllNationality(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'nationalities', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleNationality(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'nationalities/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateNationality(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'nationalities/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'nationalities/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteNationality(id: string) {
    return this.http.delete(environment.api + 'nationalities/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
