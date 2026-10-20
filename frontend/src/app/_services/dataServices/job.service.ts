import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Recruitment } from '../../core/modals';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  constructor(private http: HttpClient) { }


  getSingleJob(id: string) {
    return this.http
      .get<{ success: boolean; data: Recruitment }>(
        environment.api + 'jobs/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getCustomerCostCenters(id: string) {
    return this.http.get<{ success: boolean; data: any }>(environment.api + 'jobs/getCustomerCostCenters/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }

}
