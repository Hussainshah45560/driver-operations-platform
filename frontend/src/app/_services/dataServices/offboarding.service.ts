import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CandidateInfo, Offboarding } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class OffboardingService {
  constructor(private http: HttpClient) { }

  getAllOffboardings(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Offboarding[] }>(
        environment.api + 'offBoardings',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleOffboarding(id: string) {
    return this.http
      .get<{ success: boolean; data: Offboarding }>(
        environment.api + 'offBoardings/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateOffboarding(data: Offboarding, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'offBoardings/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'offBoardings/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }
  reasonForRejection(data: Offboarding, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'offBoardings/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'offBoardings/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  updateStatus(id: string) {
    return this.http
      .put<{ success: boolean; data: Offboarding }>(
        environment.api + 'offBoardings/changeStatus/' + id,
        {}
      )
      .pipe(map((res) => res));
  }

  deleteOffboarding(id: string) {
    return this.http.delete(environment.api + 'offBoardings/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getCandidateInfo(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: CandidateInfo }>(environment.api + 'offBoardings/candidate/details', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

}
