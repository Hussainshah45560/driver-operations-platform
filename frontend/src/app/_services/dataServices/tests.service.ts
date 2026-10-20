import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';
import { Tests } from '../../core/modals';

@Injectable({
  providedIn: 'root',
})
export class TestsService {
  constructor(private http: HttpClient) { }

  getAllTests(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Tests[] }>(
        environment.api + 'tests', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleTest(id: string) {
    return this.http
      .get<{ success: boolean; data: Tests }>(environment.api + 'tests/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getTimeSlots(params: Params) {
    return this.http
      .get<{ success: boolean; data: any }>(environment.api + 'tests/time/slots', { params: params })
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  bookTest(data: any, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'tests/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'tests/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  updateStatus(data: Object, id: string) {
    return this.http.put(environment.api + 'tests/changeStatus/' + id, data).pipe(
      map((res) => {
        return res;
      })
    );

  }


}
