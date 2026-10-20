import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CandidateDetails, Candidates, Contract, Documents, Equipment, Recruitment } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RecruitmentsService {
  constructor(private http: HttpClient) { }

  getAllRecruitments(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Recruitment[] }>(
        environment.api + 'recruitments',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getSingleRecruitment(id: string) {
    return this.http
      .get<{ success: boolean; data: Recruitment }>(
        environment.api + 'recruitments/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getCustomerCostCenters(id: string) {
    return this.http.get<{ success: boolean; data: any }>(environment.api + 'recruitments/getCustomerCostCenters/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }

  createOrUpdateRecruitment(data: Recruitment, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'recruitments/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'recruitments/',
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
      .put<{ success: boolean; data: Recruitment }>(
        environment.api + 'recruitments/changeStatus/' + id,
        {}
      )
      .pipe(map((res) => res));
  }

  deleteRecruitment(id: string) {
    return this.http.delete(environment.api + 'recruitments/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getAllDocuments(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: Documents[] }>(environment.api + 'recruitments/fetch/documents', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  saveDocument(data: Documents, id?: string) {
    const uploadData = new FormData();
    uploadData.append("customerId", data["customerId"] ? data["customerId"] : '');
    uploadData.append("type", data["type"] ? data["type"] : '');
    uploadData.append("document", data["file"][0], data["file"][0].name);

    return this.http.post(environment.api + 'recruitments/documents', uploadData).pipe(map((res) => {
      return res;
    })
    );
  }

  deleteDocument(id: string) {
    return this.http.delete(environment.api + 'recruitments/documents/' + id).pipe(map((res) => {
      return res;
    })
    );
  }

  getAllCandidates(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Candidates[] }>(
        environment.api + 'candidates/matchingCandidates',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getAllShortList(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Candidates[] }>(
        environment.api + 'candidates/shortlistedCandidates',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getAllFinalised(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: { isInductionRequired: boolean, result: Candidates[] } }>(
        environment.api + 'candidates/finalisedCandidates',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getAllEquipments(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Candidates[] }>(
        environment.api + 'candidates/allowEquipmentsToCandidates',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  shortListCandidate(id: string, data: { shortListedId: string }) {
    return this.http
      .put<{ success: boolean; data: { shortListedId: string } }>(
        environment.api + 'recruitments/shortListed/' + id,
        data
      )
      .pipe(map((res) => res));
  }

  removeShortListedCandidate(id: string, data: { shortListedId: string }) {
    return this.http
      .put<{ success: boolean; data: { shortListedId: string } }>(
        environment.api + 'recruitments/shortListed/' + id,
        data
      )
      .pipe(map((res) => res));
  }

  finaliseCandidate(id: string, data: { finalisedId: string }) {
    return this.http
      .put<{ success: boolean; data: { finalisedId: string } }>(
        environment.api + 'recruitments/finalised/' + id,
        data
      )
      .pipe(map((res) => res));
  }

  issueEqipmentToCandidate(data: Equipment, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'recruitments/equipments/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http.post(environment.api + 'recruitments/equipments', data).pipe(map((res) => {
        return res;
      })
      );
    }
  }

  getSingleEquipment(id: string) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Equipment }>(
        environment.api + 'recruitments/equipments/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getCandidateDetails(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: CandidateDetails }>(
        environment.api + 'recruitments/candidate/details',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  updateCandidateDetails(id: string, data: CandidateDetails) {
    return this.http.put(environment.api + 'recruitments/candidate/' + id, data).pipe(
      map((res) => {
        return res;
      })
    );
  }

    getContract(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data:  Contract  }>(environment.api + 'recruitments/get/contract', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  generateContract(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: { url: string, templateName: string } }>(environment.api + 'recruitments/contract/generateContract', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  saveSignedTemplate(data: object, id: string) {
    return this.http.put(environment.api + 'recruitments/sign/' + id, data).pipe(
      map((res) => {
        return res;
      })
    );
  }

   downloadContract(id: string) {
    return this.http.get(environment.api + 'recruitments/fetch/signnow/download/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }

}
