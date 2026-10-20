import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminSetting } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';



@Injectable({
  providedIn: 'root',
})
export class AdminSettingsService {
  constructor(private http: HttpClient) { }

  getAllSettings(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: AdminSetting[] }>(environment.api + 'lookup/getAdminSettings', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  // getSettingById(id: string) {
  //   return this.http.get<{ success: boolean, data: AdminSetting }>(environment.api + 'admin-settings/' + id).pipe(map((res) => {
  //     return res;
  //   })
  //   );
  // }

  createOrUpdateSetting(data: AdminSetting) {
    return this.http.post(environment.api + 'admin-settings', data).pipe(map((res) => {
      return res;
    })
    );

  }
  createOrUpdateItem(value: string[], id: string) {
    return this.http.put(environment.api + 'admin-settings/value/' + id, { value: value }).pipe(map((res) => {
      return res;
    })
    );


  }


}
