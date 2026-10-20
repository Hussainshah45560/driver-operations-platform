import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../../core/import/import.module';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { LbAutoCompleteComponent } from '../../../../core/lb-auto-complete/lb-auto-complete.component';
import { DatePickerComponent } from '../../../../core/date-picker/date-picker.component';
import { DragComponent } from '../../../../core/drag/drag.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lookupData } from '../../../../core/modals';
import { LookupService } from '../../../../_services/dataServices/lookup.service';
import { changeDateToApiFormat } from '../../../../core/utility';
import { AssetsService } from '../../../../_services/dataServices/assets.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-asset',
  standalone: true,
  imports: [
    ImportModule,
    VMessageComponent,
    LbAutoCompleteComponent,
    DatePickerComponent,
    DragComponent,
  ],
  templateUrl: './new-asset.component.html',
  styleUrl: './new-asset.component.scss',
})
export class NewAssetComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isView: boolean = false;
  uploads: {
    [key: string]: {
      file: File;
      name: string;
      size: string;
      loading: boolean;
      progress: number;
      loadingText: string;
    };
  } = {};
  selectAccessories: lookupData[] = [];
  selectSubDevice: lookupData[] = [];
  selectVehicleType: lookupData[] = [];
  selectTracking: lookupData[] = [
    { value: 'yes', name: 'Yes' },
    { value: 'no', name: 'No' },
  ];
  documentIds: string[] = [];
  documents!: any[];
  images: any = [];
  id!: string;
  params: Params = {};
  sub: Subscription | undefined;
  licenseImage!: string;
  assetImage!: string;
  constructor(
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private assetsService: AssetsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.formBuilder.group({
      registrationNumber: ['', Validators.required],
      make: ['', Validators.required],
      model: ['', Validators.required],
      chassisNumber: ['', Validators.required],
      registrationDate: [''],
      licenseExpiryDate: ['', Validators.required],
      currentMileage: ['', Validators.required],
      color: ['', Validators.required],
      vehicleTypeId: ['', [Validators.required]],
      subDeviceIds: [''],
      accessoryIds: [''],
      tracking: [''],
      trackingSupplier: [''],
      engineNumber: ['', Validators.required],
    });
    this.sub = this.route?.params.subscribe(params => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getSingleAsset();
      }
    });
    this.getVehicleTypeLookup();
  }
  ngOnInit(): void {
    const url = this.router.url;
    if (url.includes('view')) {
      this.isView = true;

      this.form.disable();
    }
  }

  getSingleAsset() {
    const sub = this.assetsService
      .getSingleAsset(this.id)
      .subscribe({
        next: (res) => {
          let data = res.data;
          this.documents = res.data?.documents ?? [];
          if (data?.vehicleTypeId != null) {
            this.getAccessoriesLookup(data?.vehicleTypeId);
            this.getSubDevicesLookup(data?.vehicleTypeId);
          }
          this.form.patchValue({
            registrationNumber: data?.registrationNumber ?? '',
            make: data?.make ?? '',
            model: data?.model ?? '',
            chassisNumber: data?.chassisNumber ?? '',
            registrationDate: data?.registrationDate ?? '',
            licenseExpiryDate: data?.licenseExpiryDate ?? '',
            currentMileage: data?.currentMileage ?? '',
            color: data?.color ?? '',
            subDeviceIds: data?.subDeviceIds ?? '',
            accessoryIds: data?.accessoryIds ?? '',
            tracking: data?.tracking == true ? 'yes' : 'no',
            trackingSupplier: data?.trackingSupplier ?? '',
            engineNumber: data?.engineNumber ?? '',
            vehicleTypeId: data?.vehicleTypeId ?? ''
          });

          if (data?.tracking) {
            this.customRequired('yes');
          }

          if (data?.documents.length > 0) {
            data?.documents.forEach((x) => {
              if (x.type == 'License Disc') {
                this.licenseImage = x?.url ?? '';
                this.documentIds.push(x._id);
              } else {
                this.assetImage = x?.url ?? '';
              }
            });
          }

          ['registrationNumber', 'make', 'model', 'chassisNumber', 'licenseExpiryDate', 'color', 'engineNumber'].forEach(field => {
            const control = this.form.get(field);
            if (control?.value && control.value !== '') {
              control.disable();
            }
          });

        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }
  getAccessoriesLookup(event: any) {
    const sub = this.lookupService
      .getSettingsLookup('Accessories', { vehicle_type_id: event })
      .subscribe({
        next: (res) => {
          this.selectAccessories = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }
  getVehicleTypeLookup() {
    const sub = this.lookupService.getSettingsLookup('VehicleTypes').subscribe({
      next: (res) => {
        this.selectVehicleType = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }
  getSubDevicesLookup(event: any) {
    const sub = this.lookupService
      .getSettingsLookup('SubDevices', { vehicle_type_id: event })
      .subscribe({
        next: (res) => {
          this.selectSubDevice = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  selectImage(files: any, type: string, check?: boolean) {
    this.images = [];
    const file = check ? files.target.files[0] : files[0];
    if (!this.uploads) this.uploads = {};
    this.uploads[type] = {
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      loading: true,
      progress: 0,
      loadingText: 'Loading...',
    };
    const interval = setInterval(() => {
      const upload = this.uploads[type];
      if (!upload) return;

      if (upload.progress >= 100) {
        upload.progress = 100;
        upload.loadingText = 'Completed';
        clearInterval(interval);
      } else {
        upload.progress += 10;
        upload.loadingText = `${upload.progress}%`;
      }
    }, 60);
    if (type == 'license') {
      this.verifyLicenseDisc(file);
    } else {
      this.images.push(file);
    }
  }

  verifyLicenseDisc(file: any) {
    const sub = this.assetsService.verifyLicenseDisc(file).subscribe({
      next: (res: any) => {
        if (res) {
          let licenseData = res.data;

          if (this.documentIds.length > 0) {
            const idsFromArr2 = this.documents?.map(obj => obj._id);

            const result = [
              ...this.documentIds?.filter(id => !idsFromArr2.includes(id)),
              ...idsFromArr2?.filter(id => !this.documentIds.includes(id))
            ];
            this.documentIds = result;
            console.log(result)
          }
          this.documentIds.push(res.data?._id)
          this.form.patchValue({
            registrationNumber: licenseData?.license_number ?? '',
            make: licenseData?.vehicle?.make ?? '',
            model: licenseData?.vehicle?.series_name ?? '',
            chassisNumber: licenseData?.vehicle?.vin ?? '',
            licenseExpiryDate: licenseData?.expiry_date ?? '',
            color: licenseData?.vehicle?.color ?? '',
            engineNumber: licenseData?.vehicle?.engine_number ?? '',
          });
          [
            'registrationNumber',
            'make',
            'model',
            'chassisNumber',
            'licenseExpiryDate',
            'color',
            'engineNumber',
          ].forEach((field) => {
            const control = this.form.get(field);
            if (control?.value && control.value !== '') {
              control.disable(); // make readonly
            }
          });
        }
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  removeUpload(type: string, input?: HTMLInputElement) {
    if (this.uploads[type]) {
      delete this.uploads[type];
      if (input) input.value = '';
    }
  }

  submit() {
    if (this.form.valid) {
      let data = this.form.getRawValue();
      data.images = this.images;
      data.licenseExpiryDate = changeDateToApiFormat(data.licenseExpiryDate);
      data.registrationDate = changeDateToApiFormat(data.registrationDate);
      data.currentMileage = Number(data.currentMileage);
      data.tracking = data.tracking == 'yes' ? true : false;
      data.documentId = this.documentIds;
      if (this.id) {
        const sub = this.assetsService
          .createOrUpdateAsset(data, this.id)
          .subscribe({
            next: (res) => {
              this.router.navigate(['/assets']);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {
        const sub = this.assetsService
          .createOrUpdateAsset(data)
          .subscribe({
            next: (res) => {
              this.router.navigate(['/assets']);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  customRequired(event: string) {
    if (event == 'yes') {
      this.form.get('trackingSupplier')?.setValidators(Validators.required);
    } else {
      this.form.get('trackingSupplier')?.clearValidators();
    }
    this.form.get('trackingSupplier')?.updateValueAndValidity();
  }

    viewDocument(url: string) {
    window.open(url, '_blank');
  }

  ngOnDestroy(): void { }
}
