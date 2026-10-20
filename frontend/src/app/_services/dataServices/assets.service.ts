import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Asset } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  constructor(private http: HttpClient) { }

  getAllAssets(params: Params) {
    return this.http
      .get<{
        success: boolean;
        pagination: Pagination;
        data: Asset[];
      }>(environment.api + 'assets', { params: params })
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }

  getSingleAsset(id: string) {
    return this.http
      .get<{ success: boolean; data: Asset }>(environment.api + 'assets/' + id)
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }

  createOrUpdateAsset(data: any, id?: string) {
    const uploadData = new FormData();
    uploadData.append('vehicleTypeId', data['vehicleTypeId']);
    uploadData.append('registrationNumber', data['registrationNumber']);
    uploadData.append('make', data['make']);
    uploadData.append('model', data['model']);
    uploadData.append('chassisNumber', data['chassisNumber']);
    uploadData.append('licenseExpiryDate', data['licenseExpiryDate']);
    uploadData.append('currentMileage', data['currentMileage']);
    uploadData.append('color', data['color']);
    uploadData.append('tracking', data['tracking']);
    uploadData.append('trackingSupplier', data['trackingSupplier']);
    uploadData.append('engineNumber', data['engineNumber']);
    if (data.images.length > 0) {
      uploadData.append('image', data['images'][0], data['images'][0].name);
    }
    if (data['registrationDate'] != '') {
      uploadData.append('registrationDate', data['registrationDate']);
    }
    if (data['subDeviceIds'].length > 0) {
      data.subDeviceIds.forEach((id: string) => {
        uploadData.append('subDeviceIds[]', id);
      });
    }
     if (data['documentId'].length > 0) {
      data.documentId.forEach((id: string) => {
        uploadData.append('documentId[]', id);
      });
    }
    if (data['accessoryIds'].length > 0) {
      data.accessoryIds.forEach((id: string) => {
        uploadData.append('accessoryIds[]', id);
      });
    }
    if (id != '' && id != undefined) {
      return this.http
        .put(
          environment.api + 'assets/' + id, uploadData
        )
        .pipe(
          map((res) => {
            return res;
          }),
        );
    } else {
      console.log(uploadData)
      return this.http
        .post(
          environment.api + 'assets', uploadData
        )
        .pipe(
          map((res) => {
            return res;
          }),
        );
    }
  }

  updateStatus(id: string) {
    return this.http
      .put<{
        success: boolean;
        data: Asset;
      }>(environment.api + 'assets/changeStatus/' + id, {})
      .pipe(map((res) => res));
  }

  verifyLicenseDisc(file: any) {
    const uploadData = new FormData();
    uploadData.append('licenseDisc', file, file.name);
    return this.http
      .post(environment.api + 'assets/verifyLicenseDisc', uploadData)
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }

  deleteAsset(id: string) {
    return this.http.delete(environment.api + 'assets/' + id).pipe(
      map((res) => {
        return res;
      }),
    );
  }
}
