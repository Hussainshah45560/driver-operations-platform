import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SettingData } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class VehicleTypesService {
  constructor(private http: HttpClient) { }

  getAllVehicleTypes(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: SettingData[] }>(
        environment.api + 'vehicleTypes', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleVehicleType(id: string) {
    return this.http
      .get<{ success: boolean; data: SettingData }>(environment.api + 'vehicleTypes/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateVehicleType(data: SettingData, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'vehicleTypes/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'vehicleTypes/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteVehicleType(id: string) {
    return this.http.delete(environment.api + 'vehicleTypes/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
