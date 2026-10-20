import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DriverEquipment, SettingData } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class EquipmentsService {
  constructor(private http: HttpClient) { }

  getAllEquipments(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'allowEquipments', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleEquipments(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'allowEquipments/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateEquipments(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'allowEquipments/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'allowEquipments/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteEquipments(id: string) {
    return this.http.delete(environment.api + 'allowEquipments/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }

   getAllDriverEquipments(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: DriverEquipment[] }>(
        environment.api + 'equipment', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
}
