import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';
import { TestType } from '../../core/modals';

@Injectable({
  providedIn: 'root',
})
export class TestTypesService {
  constructor(private http: HttpClient) {}

  getAllTestTypes(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: TestType[] }>(
        environment.api + 'testTypes',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleTestType(id: string) {
    return this.http
      .get<{ success: boolean; data: TestType }>(
        environment.api + 'testTypes/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateTestType(data: TestType, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'testTypes/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'testTypes/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteTestType(id: string) {
    return this.http.delete(environment.api + 'testTypes/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
