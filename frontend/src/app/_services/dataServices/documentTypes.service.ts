import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';
import { DocumentTypee } from '../../core/modals';

@Injectable({
  providedIn: 'root',
})
export class DocumentTypesService {
  constructor(private http: HttpClient) { }

  getAllDocumentTypes(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: DocumentTypee[] }>(
        environment.api + 'documentTypes', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleDocumentType(id: string) {
    return this.http
      .get<{ success: boolean; data: DocumentTypee }>(environment.api + 'documentTypes/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateDocumentType(data: DocumentTypee, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'documentTypes/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'documentTypes/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteDocumentType(id: string) {
    return this.http.delete(environment.api + 'documentTypes/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
