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
export class RecruitmentStatusesService {
  constructor(private http: HttpClient) { }

  getAllRecruitmentStatuses(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'recruitmentStatuses', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleRecruitmentStatuses(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'recruitmentStatuses/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateRecruitmentStatuses(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'recruitmentStatuses/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'recruitmentStatuses/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteRecruitmentStatuses(id: string) {
    return this.http.delete(environment.api + 'recruitmentStatuses/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
