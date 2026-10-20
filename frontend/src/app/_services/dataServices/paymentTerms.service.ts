import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';
import { SettingData } from '../../core/modals';


@Injectable({
  providedIn: 'root',
})
export class PaymentTermsService {
  constructor(private http: HttpClient) { }

  getAllPaymentTerms(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'paymentTerms', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSinglePaymentTerm(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'paymentTerms/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdatePaymentTerm(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'paymentTerms/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'paymentTerms/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deletePaymentTerm(id: string) {
    return this.http.delete(environment.api + 'paymentTerms/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
