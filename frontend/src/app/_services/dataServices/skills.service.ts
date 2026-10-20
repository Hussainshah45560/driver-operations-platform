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
export class SkillsService {
  constructor(private http: HttpClient) { }

  getAllSkills(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'skills', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleSkill(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'skills/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateSkill(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'skills/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'skills/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteSkill(id: string) {
    return this.http.delete(environment.api + 'skills/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
