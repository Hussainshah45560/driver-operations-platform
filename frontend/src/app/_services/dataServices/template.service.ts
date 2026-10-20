import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CmcTemplate, TemplateFields } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  constructor(private http: HttpClient) { }

  getAllTemplates(id: string) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: CmcTemplate[] }>(
        environment.api + 'cmcTemplates/get/templates/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getAllTemplateCategories() {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: { _id: string, title: string, count: number }[] }>(
        environment.api + 'cmcTemplates/list/categories'
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getTemplateFields(id: string) {
    return this.http
      .get<{ success: boolean; data: TemplateFields }>(
        environment.api + 'cmcTemplates/get/template-fields/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getSingleTemplate(id: string) {
    return this.http
      .get<{ success: boolean; data: CmcTemplate }>(
        environment.api + 'cmcTemplates/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateTemplate(data: CmcTemplate, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'cmcTemplates/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http.post(environment.api + 'cmcTemplates', data).pipe(
        map((res) => {
          return res;
        })
      );
    }
  }
  updateStatus(id: string) {
    return this.http
      .put<{ success: boolean; data: CmcTemplate }>(
        environment.api + 'cmctemplates/changeStatus/' + id,
        {}
      )
      .pipe(map((res) => res));
  }

  deleteTemplate(id: string) {
    return this.http.delete(environment.api + 'cmcTemplates/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getTemplateType(params: Params) {
    return this.http
      .get<{ success: boolean; data: CmcTemplate }>(
        environment.api + 'cmcTemplates/template/templateType', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
}
