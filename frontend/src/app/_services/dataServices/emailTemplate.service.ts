import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmailTemplate, EmailTemplateFields } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';

@Injectable({
  providedIn: 'root',
})
export class EmailTemplateService {
  constructor(private http: HttpClient) { }

  getAllEmailTemplates(id: string) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: EmailTemplate[] }>(
        environment.api + 'emailTemplates/get/templates/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getAllEmailCategories() {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: { _id: string, title: string, count: number }[] }>(
        environment.api + 'emailTemplates/list/categories'
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getTemplateFields(id: string) {
    return this.http
      .get<{ success: boolean; data: EmailTemplateFields }>(
        environment.api + 'emailTemplates/get/template-fields/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getSingleEmailTemplate(id: string) {
    return this.http
      .get<{ success: boolean; data: EmailTemplate }>(
        environment.api + 'emailTemplates/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateEmailTemplate(data: EmailTemplate, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'emailTemplates/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http.post(environment.api + 'emailTemplates', data).pipe(
        map((res) => {
          return res;
        })
      );
    }
  }
  updateStatus(id: string, data: object) {
    return this.http.put<{ success: boolean; data: EmailTemplate }>(environment.api + 'emailTemplates/changeStatus/' + id, data).pipe(map((res) => res));
  }

  deleteEmailTemplate(id: string) {
    return this.http.delete(environment.api + 'emailTemplates/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
