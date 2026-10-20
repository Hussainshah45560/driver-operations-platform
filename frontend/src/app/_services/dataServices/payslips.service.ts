import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Accessory } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PayslipService {
  constructor(private http: HttpClient) { }

  getAllPayslips(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Accessory[] }>(
        environment.api + 'payslips', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleAccessory(id: string) {
    return this.http
      .get<{ success: boolean; data: Accessory }>(environment.api + 'accessories/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateAccessory(data: Accessory, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'accessories/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'accessories/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteAccessory(id: string) {
    return this.http.delete(environment.api + 'accessories/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
