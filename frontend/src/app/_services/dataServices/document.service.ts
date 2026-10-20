import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {  Documents } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';



@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(private http: HttpClient) { }



  getAllDocuments(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: Documents[] }>(environment.api + 'documents', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  saveDocument(data: Documents, id?: string) {
    const uploadData = new FormData();
    uploadData.append("userId", data["userId"] ? data["userId"] : '');
    uploadData.append("type", data["type"] ? data["type"] : '');
    uploadData.append("document", data["file"][0] , data["file"][0].name);
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'documents/' + id, uploadData).pipe(map((res) => {
        return res;
      })
      );
    } else {
      return this.http.post(environment.api + 'documents', uploadData).pipe(map((res) => {
        return res;
      })
      );
    }

  }

  // deleteDocument(id: string) {
  //   return this.http.delete(environment.api + 'documents/' + id).pipe(map((res) => {
  //     return res;
  //   })
  //   );
  // }


}
