import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SettingData } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RecruitmentTypesService {
  constructor(private http: HttpClient) { }

  getAllRecruitmentTypes(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'recruitmentTypes', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleRecruitmentTypes(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'recruitmentTypes/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateRecruitmentTypes(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'recruitmentTypes/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'recruitmentTypes/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteRecruitmentTypes(id: string) {
    return this.http.delete(environment.api + 'recruitmentTypes/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
