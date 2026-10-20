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
export class LicenseCodesService {
  constructor(private http: HttpClient) { }

  getAllLicenseCodes(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'licenseCodes', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleLicenseCode(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'licenseCodes/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateLicenseCode(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'licenseCodes/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'licenseCodes/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteLicenseCode(id: string) {
    return this.http.delete(environment.api + 'licenseCodes/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
