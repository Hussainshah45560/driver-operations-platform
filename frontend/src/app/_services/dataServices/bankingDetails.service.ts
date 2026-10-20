import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BankingDetails } from '../../core/modals';

@Injectable({
  providedIn: 'root',
})
export class BankingDetailsService {
  constructor(private http: HttpClient) { }


  getBankingDetails() {
    return this.http
      .get<{ success: boolean; data: { bankDetails: BankingDetails } }>(environment.api + 'bankingDetails')
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateBankingDetails(data: object, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'bankingDetails/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'bankingDetails/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }


}
