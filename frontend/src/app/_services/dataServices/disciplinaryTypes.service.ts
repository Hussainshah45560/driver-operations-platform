import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DisciplinaryType } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DisciplinaryTypesService {
  constructor(private http: HttpClient) {}

  getAllDisciplinaryTypes(params: Params) {
    return this.http
      .get<{
        success: boolean;
        pagination: Pagination;
        data: DisciplinaryType[];
      }>(environment.api + 'disciplinaryTypes', { params: params })
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }
  getSingleDisciplinaryType(id: string) {
    return this.http
      .get<{
        success: boolean;
        data: DisciplinaryType;
      }>(environment.api + 'disciplinaryTypes/' + id)
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }

  createOrUpdateDisciplinaryType(data: DisciplinaryType, id?: string) {
    if (id != '' && id != undefined) {
      return this.http
        .put(environment.api + 'disciplinaryTypes/' + id, data)
        .pipe(
          map((res) => {
            return res;
          }),
        );
    } else {
      return this.http
        .post<{
          success: boolean;
          data: any;
        }>(environment.api + 'disciplinaryTypes/', data)
        .pipe(
          map((res) => {
            return res;
          }),
        );
    }
  }

  deleteDisciplinaryType(id: string) {
    return this.http.delete(environment.api + 'disciplinaryTypes/' + id).pipe(
      map((res) => {
        return res;
      }),
    );
  }
}
