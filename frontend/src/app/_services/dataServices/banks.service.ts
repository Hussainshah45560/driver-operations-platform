import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Banks } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class BanksService {
  constructor(private http: HttpClient) { }

  getAllBanks(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Banks[] }>(
        environment.api + 'banks', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleBank(id: string) {
    return this.http
      .get<{ success: boolean; data: Banks }>(environment.api + 'banks/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateBank(data: Banks, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'banks/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'banks',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteBank(id: string) {
    return this.http.delete(environment.api + 'banks/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
