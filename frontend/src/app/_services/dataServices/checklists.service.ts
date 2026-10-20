import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Checklist } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ChecklistsService {
  constructor(private http: HttpClient) {}

  getAllChecklists(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Checklist[] }>(
        environment.api + 'Checklists',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleChecklist(id: string) {
    return this.http
      .get<{ success: boolean; data: Checklist }>(
        environment.api + 'Checklists/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateChecklist(data: Checklist, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'Checklists/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'Checklists/',
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
        .put<{ success: boolean; data: Checklist }>(
          environment.api + 'Checklists/changeStatus/' + id,
          {}
        )
        .pipe(map((res) => res));
    }
  deleteChecklist(id: string) {
    return this.http.delete(environment.api + 'Checklists/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
