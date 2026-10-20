import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';
import { Aod, CandidateInfo, Disciplinary, Dispute, Documents, Hearing, WarningList, } from '../../core/modals';

@Injectable({
  providedIn: 'root',
})
export class DisciplinaryService {
  constructor(private http: HttpClient) { }

  getAllDisciplinaries(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Disciplinary[] }>(
        environment.api + 'disciplinaries',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getDisciplinaryData(id: string, step: string) {
    return this.http
      .get<{ success: boolean; data: Disciplinary }>(
        environment.api + 'disciplinaries/getDisciplinaryStep' + step + '/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }


  createOrUpdateDisciplinary(data: Disciplinary, step: string, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'disciplinaries/saveDisciplinary' + step + '/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: Disciplinary }>(
          environment.api + 'disciplinaries/saveDisciplinary' + step,
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteDisciplinary(id: string) {
    return this.http.delete(environment.api + 'disciplinaries/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }



  getAllDocuments(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: Documents[] }>(environment.api + 'disciplinaries/fetch/documents', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  saveDocument(data: Documents, id?: string) {
    const uploadData = new FormData();
    uploadData.append("userId", data["userId"] ? data["userId"] : '');
    uploadData.append("type", data["type"] ? data["type"] : '');
    uploadData.append("document", data["file"][0], data["file"][0].name);
    uploadData.append("disciplinaryId", data["disciplinaryId"] ? data["disciplinaryId"] : '');

    return this.http.post(environment.api + 'disciplinaries/documents', uploadData).pipe(map((res) => {
      return res;
    })
    );
  }

  deleteDocument(id: string) {
    return this.http.delete(environment.api + 'disciplinaries/documents/' + id).pipe(map((res) => {
      return res;
    })
    );
  }

  getCandidateInfo(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: CandidateInfo }>(environment.api + 'disciplinaries/candidate/details', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  saveLogRequest(data: object, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'disciplinaries/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http.post(environment.api + 'disciplinaries', data).pipe(map((res) => {
        return res;
      })
      );
    }
  }

  getWarningsData(id: string) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: { warnings: WarningList[], warningReasonId: string } }>(environment.api + 'disciplinaries/' + id).pipe(map((res) => {
      return res;
    })
    );
  }

  getEnquiryTemplate(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: { url: string, template: string } }>(environment.api + 'disciplinaries/get/enquiryTemplate', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  sendNotice(data: Object, id: string) {
    return this.http.put(environment.api + 'disciplinaries/sendNotice/' + id, data).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getHearing(id: string, params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: { hearing: Hearing } }>(environment.api + 'disciplinaries/getDisciplinary/' + id, { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  getDispute(id: string, params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: { dispute: Dispute } }>(environment.api + 'disciplinaries/getDisciplinary/' + id, { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  updateHearing(data: Object, id: string) {
    return this.http.put(environment.api + 'disciplinaries/updateHearing/' + id, data).pipe(
      map((res) => {
        return res;
      })
    );
  }

  updateDispute(data: Object, id: string) {
    return this.http.put(environment.api + 'disciplinaries/updateDispute/' + id, data).pipe(
      map((res) => {
        return res;
      })
    );
  }


  createOrUpdateAod(data: Aod, id?: string) {
    return this.http.put(environment.api + 'disciplinaries/updateAOD/' + id, data).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getDisiplinaryAod(id: string) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: Aod }>(environment.api + 'disciplinaries/getAOD/' + id).pipe(map((res) => {
      return res;
    })
    );
  }

  saveSignedTemplate(data: object, id: string) {
    return this.http.put(environment.api + 'disciplinaries/sign/' + id, data).pipe(
      map((res) => {
        return res;
      })
    );
  }

  downloadContract(params: Params) {
    return this.http.get(environment.api + 'disciplinaries/fetch/download', { params: params }).pipe(
      map((res) => {
        return res;
      })
    );
  }


}