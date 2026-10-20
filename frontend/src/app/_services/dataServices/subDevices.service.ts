import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SubDevice } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SubDevicesService {
  constructor(private http: HttpClient) { }

  getAllSubDevices(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SubDevice[] }>(
        environment.api + 'subDevices', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleSubDevice(id: string) {
    return this.http
      .get<{ success: boolean; data: SubDevice }>(environment.api + 'subDevices/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateSubDevice(data: SubDevice, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'subDevices/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'subDevices/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteSubDevice(id: string) {
    return this.http.delete(environment.api + 'subDevices/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
