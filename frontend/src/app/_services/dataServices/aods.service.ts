import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Aod, Profile } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AodsService {
  constructor(private http: HttpClient) { }

  getAllAods(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Aod[] }>(
        environment.api + 'aods',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getAllAodsForDriver(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Aod[] }>(
        environment.api + 'aods/user/AOD',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getSingleAod(id: string) {
    return this.http
      .get<{ success: boolean; data: Aod }>(
        environment.api + 'aods/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getProfileData(id: string) {
    return this.http
      .get<{ success: boolean; data: Profile }>(
        environment.api + 'aods/getProfileData/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateAod(data: Aod, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'aods/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'aods/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteAod(id: string) {
    return this.http.delete(environment.api + 'aods/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getTemplateToSign(id: string, params?: Params) {
    return this.http
      .get<{ success: boolean; data: any }>(
        environment.api + 'aods/getTemplate/' + id, { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  saveSignedTemplate(data: object, id: string) {
    return this.http.put(environment.api + 'aods/sign/' + id, data).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
