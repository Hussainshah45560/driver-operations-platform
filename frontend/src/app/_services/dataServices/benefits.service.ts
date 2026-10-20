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
export class BenefitsService {
  constructor(private http: HttpClient) { }

  getAllBenefits(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'benefits', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleBenefit(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'benefits/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateBenefit(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'benefits/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'benefits/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteBenefit(id: string) {
    return this.http.delete(environment.api + 'benefits/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
