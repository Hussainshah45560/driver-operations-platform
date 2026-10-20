import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { lookupData } from '../../core/modals';
import { Params } from '@angular/router';



@Injectable({
  providedIn: 'root',
})
export class LookupService {
  constructor(private http: HttpClient) { }


  getRolesLookup(params: Params = {}) {
    return this.http.get<{ success: boolean, data: lookupData[] }>(environment.api + 'lookup/getRoles', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  getSettingsLookup(type: string, params?: Params) {
    return this.http.get<{ success: boolean, data: lookupData[] }>(environment.api + 'lookup/get' + type, { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  getAppSettingLookup(params: Params) {
    return this.http.get<{ success: boolean, data: lookupData[] }>(environment.api + 'lookup/getStatus', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

}