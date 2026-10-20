import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';
import { CandidateInfo, Checklist, Documents, Induction } from '../../core/modals';

@Injectable({
  providedIn: 'root',
})
export class InductionService {
  constructor(private http: HttpClient) { }

  getAllInductions(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Induction[] }>(
        environment.api + 'inductions',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getInductionData(id: string, step: string) {
    return this.http
      .get<{ success: boolean; data: Induction }>(
        environment.api + 'inductions/candidate/application' + step + '/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getInductionStep1(params: Params) {
    return this.http
      .get<{ success: boolean; data: Induction }>(
        environment.api + 'inductions/candidate/application', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getChecklistStep(id: String) {
    return this.http
      .get<{ success: boolean; data: Induction }>(
        environment.api + 'inductions/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateInduction(data: Induction, step: string, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'inductions/saveInduction' + step + '/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: Induction }>(
          environment.api + 'inductions/saveInduction' + step,
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteInduction(id: string) {
    return this.http.delete(environment.api + 'inductions/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getAllDocuments(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: Documents[] }>(environment.api + 'inductions/fetch/documents', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  saveDocument(data: Documents, id?: string) {
    const uploadData = new FormData();
    uploadData.append("userId", data["userId"] ? data["userId"] : '');
    uploadData.append("type", data["type"] ? data["type"] : '');
    uploadData.append("document", data["file"][0], data["file"][0].name);

    return this.http.post(environment.api + 'inductions/documents', uploadData).pipe(map((res) => {
      return res;
    })
    );
  }


  deleteDocument(id: string) {
    return this.http.delete(environment.api + 'inductions/documents/' + id).pipe(map((res) => {
      return res;
    })
    );
  }

  getCandidateInfo(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: CandidateInfo }>(environment.api + 'inductions/candidate/details', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  getCustomerCheckList(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: { checklists: Checklist[] } }>(environment.api + 'inductions/customer/checklist', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }


  saveAndUpdateCheckListStep(data: object, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'inductions/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http.post(environment.api + 'inductions', data).pipe(map((res) => {
        return res;
      })
      );
    }
  }

  updateDriverTesting(data: object, id: string) {
    return this.http.put(environment.api + 'inductions/updateDriverTesting/' + id, data).pipe(
      map((res) => {
        return res;
      })
    );
  }

  updateVehicleTesting(data: object, id: string) {
    return this.http.put(environment.api + 'inductions/updateVehicleTesting/' + id, data).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getContract(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: { url: string } }>(environment.api + 'inductions/get/contract', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  generateContract(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: { url: string, templateName: string } }>(environment.api + 'inductions/contract/generateContract', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  saveSignedTemplate(data: object, id: string) {
    return this.http.put(environment.api + 'inductions/sign/' + id, data).pipe(
      map((res) => {
        return res;
      })
    );
  }

  downloadContract(id: string) {
    return this.http.get(environment.api + 'inductions/fetch/signnow/download/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }

}
