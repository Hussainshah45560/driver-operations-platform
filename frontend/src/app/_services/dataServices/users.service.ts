import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) { }

  getAllUsers(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: User[] }>(
        environment.api + 'users', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleUser(id: string) {
    return this.http
      .get<{ success: boolean; data: User }>(environment.api + 'users/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateUser(data: User, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'users/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'users',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  updateStatus(id: string) {
    return this.http
      .put<{ success: boolean; data: User }>(
        environment.api + 'users/changeStatus/' + id,
        {}
      )
      .pipe(map((res) => res));
  }

  updateProfile(id: string, data: User) {
    return this.http
      .put<{ success: boolean; data: User }>(
        environment.api + 'users/updateProfile/' + id,
        data
      )
      .pipe(map((res) => res));
  }

  updatePassword(data: object) {
    return this.http
      .put<{ success: boolean }>(
        environment.api + 'users/updatePassword/',
        data
      )
      .pipe(map((res) => res));
  }


  deleteUser(id: string) {
    return this.http.delete(environment.api + 'users/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getProfileData() {
    return this.http
      .get<{ success: boolean; data: User }>(environment.api + 'users/me')
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
}
