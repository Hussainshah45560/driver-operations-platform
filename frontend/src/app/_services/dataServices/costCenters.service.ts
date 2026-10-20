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
export class CostCentersService {
  constructor(private http: HttpClient) { }

  getAllCostCenters(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'costCenters', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleCostCenters(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'costCenters/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateCostCenters(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'costCenters/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'costCenters/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteCostCenters(id: string) {
    return this.http.delete(environment.api + 'costCenters/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
