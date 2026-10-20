import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';



@Injectable({
  providedIn: 'root',
})
export class RolesService {
  constructor(private http: HttpClient) { }



  getAllRoles(params: any) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: Role[] }>(environment.api + 'roles', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  getSingleRole(id: string) {
    return this.http.get<{ success: boolean, data: Role }>(environment.api + 'roles/' + id).pipe(map((res) => {
      return res;
    })
    );
  }
  
  createOrUpdateRole(data: Role, id?: string) {
    if (id != undefined && id != '') {
      return this.http.put(environment.api + 'roles/' + id, data).pipe(map((res) => {
        return res;
      })
      );
    } else {
      return this.http.post(environment.api + 'roles', data).pipe(map((res) => {
        return res;
      })
      );
    }

  }

  deleteRole(id: string) {
    return this.http.delete(environment.api + 'roles/' + id).pipe(map((res) => {
      return res;
    })
    );
  }
}
