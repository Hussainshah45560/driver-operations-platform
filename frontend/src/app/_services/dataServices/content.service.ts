import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Content } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  constructor(private http: HttpClient) { }

  getAllContents(params: any) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Content[] }>(
        environment.api + 'content-pages',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleContent(id: string) {
    return this.http
      .get<{ success: boolean; data: Content }>(
        environment.api + 'content-pages/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateContent(data: Content, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'content-pages/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http.post(environment.api + 'content-pages', data).pipe(
        map((res) => {
          return res;
        })
      );
    }
  }

  updateStatus(id: string) {
    return this.http.put<{ success: boolean; data: Content }>(environment.api + 'content-pages/changeStatus/' + id, {}).pipe(map((res) => res));
  }

  deleteContent(id: string) {
    return this.http.delete(environment.api + 'content-pages/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
