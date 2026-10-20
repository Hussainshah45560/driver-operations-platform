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
export class RegionsService {
  constructor(private http: HttpClient) { }

  getAllRegions(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'regions', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleRegion(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'regions/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateRegion(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'regions/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'regions/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteRegion(id: string) {
    return this.http.delete(environment.api + 'regions/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
