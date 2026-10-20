import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';
import { RelationType } from '../../core/modals';

@Injectable({
  providedIn: 'root',
})
export class RelationTypesService {
  constructor(private http: HttpClient) { }

  getAllRelationTypes(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: RelationType[] }>(
        environment.api + 'relationTypes', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleRelationType(id: string) {
    return this.http
      .get<{ success: boolean; data: RelationType }>(environment.api + 'relationTypes/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateRelationType(data: RelationType, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'relationTypes/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'relationTypes/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteRelationType(id: string) {
    return this.http.delete(environment.api + 'relationTypes/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
