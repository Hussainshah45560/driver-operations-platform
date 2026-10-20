import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Area } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AreasService {
  constructor(private http: HttpClient) { }

  getAllAreas(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Area[] }>(
        environment.api + 'areas', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleArea(id: string) {
    return this.http
      .get<{ success: boolean; data: Area }>(environment.api + 'areas/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateArea(data: Area, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'areas/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'areas/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteArea(id: string) {
    return this.http.delete(environment.api + 'areas/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
