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
export class ChecklistTypesService {
  constructor(private http: HttpClient) {}

  getAllChecklistTypes(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'checklistTypes',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleChecklistType(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(
        environment.api + 'checklistTypes/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateChecklistType(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'checklistTypes/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'checklistTypes/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteChecklistType(id: string) {
    return this.http.delete(environment.api + 'checklistTypes/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
