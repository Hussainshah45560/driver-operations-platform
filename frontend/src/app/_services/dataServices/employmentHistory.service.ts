import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmploymentHistory } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';



@Injectable({
  providedIn: 'root',
})
export class EmploymentHistoryService {
  constructor(private http: HttpClient) { }



  getAllEmploymentHistory(params: any) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: EmploymentHistory[] }>(environment.api + 'employment-history', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }
  getSingleEmployment(id: string) {
    return this.http.get<{ success: boolean, data: EmploymentHistory }>(environment.api + 'employment-history/' + id).pipe(map((res) => {
      return res;
    })
    );
  }

  createOrUpdateEmployment(data: EmploymentHistory, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'employment-history/' + id, data).pipe(map((res) => {
        return res;
      })
      );
    } else {
      return this.http.post(environment.api + 'employment-history', data).pipe(map((res) => {
        return res;
      })
      );
    }

  }

  deleteCountry(id: string) {
    return this.http.delete(environment.api + 'employment-history/' + id).pipe(map((res) => {
      return res;
    })
    );
  }


}
