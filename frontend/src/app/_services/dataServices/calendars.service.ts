import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Calendar } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CalendarsService {
  constructor(private http: HttpClient) { }

  getAllCalendars(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Calendar[] }>(
        environment.api + 'calendars',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleCalendar(id: string) {
    return this.http
      .get<{ success: boolean; data: Calendar }>(
        environment.api + 'calendars/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateCalendar(data: Calendar, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'calendars/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'calendars/',
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
      .put<{ success: boolean; data: Calendar }>(
        environment.api + 'calendars/changeStatus/' + id,
        {}
      )
      .pipe(map((res) => res));
  }

  deleteCalendar(id: string) {
    return this.http.delete(environment.api + 'calendars/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
