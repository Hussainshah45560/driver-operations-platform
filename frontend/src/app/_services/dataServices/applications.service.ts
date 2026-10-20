import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Application, Documents } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';



@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
  constructor(private http: HttpClient) { }

  getAllApplications(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: Application[] }>(environment.api + 'applications', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  getRequiredDocuments(params: Params) {
    return this.http.get<{ success: boolean, data: string[] }>(environment.api + 'applications/fetch/getRequiredDocuments', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  // getSingleApplication(id: string) {
  //   return this.http.get<{ success: boolean, data: Application }>(environment.api + 'applications/' + id).pipe(map((res) => {
  //     return res;
  //   })
  //   );
  // }

  createOrUpdateSteps(data: any, step: string, id?: string, type?: string) {
    if (id != '' && id != undefined) {
      const uploadData = new FormData();
      if (type == 'formData') {
        uploadData.append("userId", data["userId"]);
        uploadData.append("vehicleTypeId", data["vehicleTypeId"]);
        uploadData.append("registrationNumber", data["registrationNumber"]);
        uploadData.append("make", data["make"]);
        uploadData.append("model", data["model"]);
        uploadData.append("chassisNumber", data["chassisNumber"]);
        uploadData.append("licenseExpiryDate", data["licenseExpiryDate"]);
        uploadData.append("currentMileage", data["currentMileage"]);
        uploadData.append("color", data["color"]);
        uploadData.append("tracking", data["tracking"]);
        uploadData.append("trackingSupplier", data["trackingSupplier"]);
        uploadData.append("engineNumber", data["engineNumber"]);
        if (data.images.length > 0) {
          uploadData.append("image", data["images"][0], data["images"][0].name);
        }

        if (data["subDeviceIds"].length > 0) {
          data.subDeviceIds.forEach((id: string) => {
            uploadData.append('subDeviceIds[]', id);
          });
        }
        if (data["accessoryIds"].length > 0) {
          data.accessoryIds.forEach((id: string) => {
            uploadData.append('accessoryIds[]', id);
          });

        }


      }
      return this.http.put(environment.api + 'applications/save' + step + '/' + id, type == 'formData' ? uploadData : data).pipe(map((res) => {
        return res;
      })
      );
    } else {
      return this.http.post<{ success: boolean, data: any }>(environment.api + 'applications/save' + step, data).pipe(map((res) => {
        return res;
      })
      );
    }
  }

  getStepData(step: string, id: string) {
    return this.http.get<{ success: boolean, data: any }>(environment.api + 'applications/getStep' + step + '/' + id).pipe(map((res) => {
      return res;
    })
    );
  }

  getStepsStatus(id: string) {
    return this.http.get<{ success: boolean, data: any }>(environment.api + 'applications/getApplicationSteps/' + id).pipe(map((res) => {
      return res;
    })
    );
  }

  deleteApplication(id: string) {
    return this.http.delete(environment.api + 'applications/' + id).pipe(map((res) => {
      return res;
    })
    );
  }

  approveStep(id: string, data: object, step: string, params?: Params) {
    return this.http.put(environment.api + 'applications/approve' + step + '/' + id, data, { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  verifyLicenseDisc(file: any, id: string) {
    const uploadData = new FormData();
    uploadData.append('licenseDisc', file, file.name);
    return this.http.post(environment.api + 'applications/verifyLicenseDisc/' + id, uploadData).pipe(map((res) => {
      return res;
    })
    );
  }

  getAllDocumentsByApplicationId(params: Params) {
    return this.http.get<{ success: boolean, pagination: Pagination, data: Documents[] }>(environment.api + 'applications/documents', { params: params }).pipe(map((res) => {
      return res;
    })
    );
  }

  saveDocument(data: Documents, id?: string) {
    const uploadData = new FormData();
    uploadData.append("userId", data["userId"] ? data["userId"] : '');
    uploadData.append("type", data["type"] ? data["type"] : '');
    uploadData.append("document", data["file"][0], data["file"][0].name);
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'applications/documents/' + id, uploadData).pipe(map((res) => {
        return res;
      })
      );
    } else {
      return this.http.post(environment.api + 'applications/documents', uploadData).pipe(map((res) => {
        return res;
      })
      );
    }

  }

  deleteDocument(id: string) {
    return this.http.delete(environment.api + 'applications/documents/' + id).pipe(map((res) => {
      return res;
    })
    );
  }




}
