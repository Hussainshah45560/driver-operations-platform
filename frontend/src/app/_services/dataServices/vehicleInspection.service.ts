import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';
import { Checklist, VehicleInspection } from '../../core/modals';

@Injectable({
  providedIn: 'root',
})
export class VehicleInspectionService {
  constructor(private http: HttpClient) { }

  getAllVehicleInspection(params: Params) {
    return this.http
      .get<{
        success: boolean;
        pagination: Pagination;
        data: VehicleInspection[];
      }>(environment.api + 'inspections', { params: params })
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }

  getVehicleInspection(id: string) {
    return this.http
      .get<{
        success: boolean;
        data: VehicleInspection;
      }>(environment.api + 'inspections/' + '/' + id)
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }
  deleteVehicleInspection(id: string) {
    return this.http.delete(environment.api + 'inspections/' + id).pipe(
      map((res) => {
        return res;
      }),
    );
  }
  getCustomerCheckList(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: { checklists: Checklist[] } }>(environment.api + 'inspections/customer/checklist', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }
}
