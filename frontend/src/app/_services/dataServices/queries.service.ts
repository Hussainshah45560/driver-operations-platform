import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CandidateInfo, Queries } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class QueriesService {
  constructor(private http: HttpClient) { }

  getAllQueries(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Queries[] }>(
        environment.api + 'queries',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getAllUserQueries(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Queries[] }>(
        environment.api + 'queries/user/queries',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getSingleQuery(id: string) {
    return this.http
      .get<{ success: boolean; data: Queries }>(
        environment.api + 'queries/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateQueries(data: Queries, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'queries/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'queries/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  createOrUpdateDriverQueries(data: object) {
    return this.http
      .post<{ success: boolean; data: any }>(
        environment.api + 'queries/newQuery',
        data
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  updateStatus(id: string) {
    return this.http
      .put<{ success: boolean; data: Queries }>(
        environment.api + 'queries/changeStatus/' + id,
        {}
      )
      .pipe(map((res) => res));
  }

  deleteQuery(id: string) {
    return this.http.delete(environment.api + 'queries/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }

  assignToAdmin(data: object) {
    return this.http
      .post<{ success: boolean; data: any }>(
        environment.api + 'queries/assignToAdmin',
        data
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getCandidateInfo(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: CandidateInfo }>(environment.api + 'queries/candidate/details', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

}
