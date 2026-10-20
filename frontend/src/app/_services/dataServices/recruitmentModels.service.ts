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
export class RecruitmentModelsService {
  constructor(private http: HttpClient) { }

  getAllRecruitmentModels(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'recruitmentModels', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleRecruitmentModels(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'recruitmentModels/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateRecruitmentModels(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'recruitmentModels/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'recruitmentModels/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteRecruitmentModels(id: string) {
    return this.http.delete(environment.api + 'recruitmentModels/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
