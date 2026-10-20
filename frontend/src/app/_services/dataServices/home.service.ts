import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Home, Role } from '../../core/modals';
import { Params } from '@angular/router';



@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(private http: HttpClient) { }



  getHomeData(params: Params) {
    return this.http.get<{ success: boolean, data: Home }>(environment.api + 'home', { params: params }).pipe(map((res) => {
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

  // createOrUpdateRole(data: Role, id?: string) {
  //   if (id != undefined && id != '') {
  //     return this.http.put(environment.api + 'roles/' + id, data).pipe(map((res) => {
  //       return res;
  //     })
  //     );
  //   } else {
  //     return this.http.post(environment.api + 'roles', data).pipe(map((res) => {
  //       return res;
  //     })
  //     );
  //   }

  // }

  // deleteRole(id: string) {
  //   return this.http.delete(environment.api + 'roles/' + id).pipe(map((res) => {
  //     return res;
  //   })
  //   );
  // }
}
