import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';
import { Contract } from '../../core/modals';

@Injectable({
  providedIn: 'root',
})
export class ContractsService {
  constructor(private http: HttpClient) { }

  getAllContracts(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Contract[] }>(
        environment.api + 'contracts', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getTemplateToSign(id: string, params?: Params) {
    return this.http
      .get<{ success: boolean; data: any }>(
        environment.api + 'contracts/' + id, { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  saveSignedTemplate(data: object, id: string) {
    return this.http.put(environment.api + 'contracts/sign/' + id, data).pipe(
      map((res) => {
        return res;
      })
    );
  }

  downloadContract(id: string, dest: boolean = false) {
    if (dest == true) {
      return this.http.get(environment.api + 'contracts/fetch/signnow/download/' + id).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http.get(environment.api + 'contracts/fetch/download/' + id).pipe(
        map((res) => {
          return res;
        })
      );
    }

  }

}
