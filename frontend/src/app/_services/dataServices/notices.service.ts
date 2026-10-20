import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Documents, Notices } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NoticesService {
  constructor(private http: HttpClient) { }

  getAllNotices(params: Params, id: string) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Notices }>(
        environment.api + 'notices/' + id, { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getDocumentToSign(params: Params) {
    return this.http
      .get<{ success: boolean; data: Documents[] }>(environment.api + 'notices/fetch/documents', { params: params })
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateNotices(data: Notices, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'notices/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'notices/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteNotices(id: string) {
    return this.http.delete(environment.api + 'notices/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }


  saveSignedTemplate(data: object, id: string) {
    return this.http.put(environment.api + 'notices/sign/' + id, data).pipe(
      map((res) => {
        return res;
      })
    );
  }

  downloadContract(params: Params) {
    return this.http.get(environment.api + 'notices/fetch/download', { params: params }).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
