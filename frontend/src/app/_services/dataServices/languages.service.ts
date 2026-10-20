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
export class LanguagesService {
  constructor(private http: HttpClient) { }

  getAllLanguages(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'languages', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleLanguage(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'languages/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateLanguage(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'languages/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'languages/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteLanguage(id: string) {
    return this.http.delete(environment.api + 'languages/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
