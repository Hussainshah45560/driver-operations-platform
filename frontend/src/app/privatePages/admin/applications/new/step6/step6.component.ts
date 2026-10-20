import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { DatePickerComponent } from '../../../../../core/date-picker/date-picker.component';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { ImportModule } from '../../../../../core/import/import.module';
import { ApplicationsService } from '../../../../../_services/dataServices/applications.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { lookupData } from '../../../../../core/modals';
import { changeDateToApiFormat } from '../../../../../core/utility';
import { DragComponent } from '../../../../../core/drag/drag.component';
import { AuthService } from '../../../../../_services/common/auth.service';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { StatusCheckService } from '../../../../../_services/dataServices/statusCheck.service';
import { ScrollService } from '../../../../../_services/common/scroll.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-step6',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent, DatePickerComponent, DragComponent],
  templateUrl: './step6.component.html',
  styleUrl: './step6.component.scss'
})
export class Step6Component implements OnInit, OnDestroy {
  step6!: FormGroup;
  stepStatus!: string;
  isView: boolean = false;
  step6Changes: any;
  stepData: any;
  role!: string;
  approvalForm: FormGroup;
  rejected: boolean = false;
  params: Params = {};
  sub: Subscription | undefined;
  id!: string;
  images: any = [];
  userId!: string;
  isAssetUploaded: boolean = true;
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
    { value: 'no', name: 'No' }
  ];

  constructor(private formBuilder: FormBuilder, private applicationsService: ApplicationsService, private route: ActivatedRoute, private router: Router,
    private scrollService: ScrollService,
    private lookupService: LookupService, private authService: AuthService,
    public badgeColorService: BadgeColorService, public statusCheckService: StatusCheckService,
    private toasterService: ToastrService
  ) {
    this.step6 = this.formBuilder.group({
      // licenseDisk: [''],
      registrationNumber: ['', Validators.required],
      make: ['', Validators.required],
      model: ['', Validators.required],
      chassisNumber: ['', Validators.required],
      // registrationDate: [''],
      licenseExpiryDate: ['', Validators.required],
      currentMileage: ['', Validators.required],
      color: ['', Validators.required],
      vehicleTypeId: ['', [Validators.required]],
      subDeviceIds: [''],
      accessoryIds: [''],
      tracking: [''],
      trackingSupplier: [''],
      engineNumber: ['', Validators.required]
    });
    this.approvalForm = this.formBuilder.group({
      reason: ['']
    })

    this.role = this.authService.userDetails?.role?.name ?? '';
    this.sub = this.route.parent?.params.subscribe(params => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getStepData();
      }
    });
    this.getVehicleTypeLookup();
  }
  ngOnInit(): void {
    const url = this.router.url;
    if (url.includes('view')) {
      this.isView = true;

      this.step6.disable();
    }
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  approveStep(status: string) {
    const data = Object.assign({});
    if (this.approvalForm.value.reason != '') {
      data.reason = this.approvalForm.value.reason
    };
    data.status = status;
    const sub = this.applicationsService
      .approveStep(this.id, data, 'Step6')
      .subscribe({
        next: (res) => {
          this.router.navigate(['/applications/view/' + this.id + '/step7']);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getAccessoriesLookup(event: Event) {
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
    const sub = this.lookupService
      .getSettingsLookup('VehicleTypes')
      .subscribe({
        next: (res) => {
          this.selectVehicleType = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }
  getSubDevicesLookup(event: Event) {
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
  getStepData() {
    const sub = this.applicationsService
      .getStepData('6', this.id)
      .subscribe({
        next: (res) => {
          this.stepData = res.data;
          if (!this.statusCheckService.isStepValid('editable', this.stepData?.stepStatus?.step6, this.stepData?.applicationStatus)
          ) {
            this.router.navigate(['/applications/view/' + this.id + '/step6']);
          }
          this.userId = res.data.userId;
          if (this.stepData.stepStatus.step6 == 'changed') {
            this.step6.disable();
          }
          if (this.stepData && this.stepData?.step6Changes) {
            this.step6Changes = this.stepData?.step6Changes;
          }
          if (this.stepData?.asset?.vehicleTypeId != null) {
            this.getAccessoriesLookup(this.stepData?.asset?.vehicleTypeId);
            this.getSubDevicesLookup(this.stepData?.asset?.vehicleTypeId);
          }

          this.step6.patchValue({
            //licenseDisk: this.stepData?.licenseDisk ?? '',
            registrationNumber: this.stepData?.asset?.registrationNumber ?? '',
            make: this.stepData?.asset?.make ?? '',
            model: this.stepData?.asset?.model ?? '',
            chassisNumber: this.stepData?.asset?.chassisNumber ?? '',
            // registrationDate: this.stepData?.asset?.registrationDate ?? '',
            licenseExpiryDate: this.stepData?.asset?.licenseExpiryDate ?? '',
            currentMileage: this.stepData?.asset?.currentMileage ?? '',
            color: this.stepData?.asset?.color ?? '',
            subDeviceIds: this.stepData?.asset?.subDeviceIds ?? '',
            accessoryIds: this.stepData?.asset?.accessoryIds ?? '',
            tracking: this.stepData?.asset?.tracking == true ? 'yes' : 'no',
            trackingSupplier: this.stepData?.asset?.trackingSupplier ?? '',
            engineNumber: this.stepData?.asset?.engineNumber ?? '',
            vehicleTypeId: this.stepData?.asset?.vehicleTypeId ?? ''
          });
          this.isAssetUploaded = false;
          if (this.stepData?.asset?.tracking) {
            this.customRequired('yes');
          }
          ['registrationNumber', 'make', 'model', 'chassisNumber', 'licenseExpiryDate', 'color', 'engineNumber'].forEach(field => {
            const control = this.step6.get(field);
            if (control?.value && control.value !== '') {
              control.disable(); // make readonly
            }
          });

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
      this.verifyLicenseDisc(file)
    } else {
      this.isAssetUploaded = true;
      this.images.push(file);
    }
  }

  verifyLicenseDisc(file: any) {
    const sub = this.applicationsService
      .verifyLicenseDisc(file, this.id)
      .subscribe({
        next: (res: any) => {
          if (res) {
            let licenseData = res.data;
            this.step6.patchValue({
              //licenseDisk: licenseData?.license_number ?? '',
              registrationNumber: licenseData?.license_number ?? '',
              make: licenseData?.vehicle?.make ?? '',
              model: licenseData?.vehicle?.series_name ?? '',
              chassisNumber: licenseData?.vehicle?.vin ?? '',
              licenseExpiryDate: licenseData?.expiry_date ?? '',
              color: licenseData?.vehicle?.color ?? '',
              engineNumber: licenseData?.vehicle?.engine_number ?? ''
            });
            ['registrationNumber', 'make', 'model', 'chassisNumber', 'licenseExpiryDate', 'color', 'engineNumber'].forEach(field => {
              const control = this.step6.get(field);
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

  goBack() {
    this.router.navigate(['/applications/' + (this.isView ? 'view/' : 'edit/') + this.id + '/step5']);
  }

  removeUpload(type: string, input?: HTMLInputElement) {
    if (this.uploads[type]) {
      delete this.uploads[type];
      if (input) input.value = '';
    }
  }

  submit() {
    if (this.isAssetUploaded && this.images.length == 0) {
      this.toasterService.error('Asset image is required', 'Error');
    }
    if (this.step6.valid && (this.images.length > 0 || !this.isAssetUploaded)) {
      let data = this.step6.getRawValue();
      data.userId = this.userId;
      data.images = this.images;
      data.licenseExpiryDate = changeDateToApiFormat(data.licenseExpiryDate);
      // data.registrationDate = changeDateToApiFormat(data.registrationDate);
      data.currentMileage = Number(data.currentMileage);
      data.tracking = data.tracking == 'yes' ? true : false
      if (this.id) {
        const sub = this.applicationsService.createOrUpdateSteps(data, 'Step6', this.id, 'formData').subscribe({
          next: (res) => {
            this.router.navigate(['/applications/edit/' + this.id + '/step7']);
            sub.unsubscribe();
          },
          error: (res) => {
            sub.unsubscribe();
          },
        });
      }
    }
    else {
      this.step6.markAllAsTouched();
      this.scrollService.scrollToFirstInvalid()
    }
  }

  customRequired(event: string) {
    if (event == "yes") {
      this.step6.get('trackingSupplier')?.setValidators(Validators.required);
    } else {
      this.step6.get('trackingSupplier')?.clearValidators();
    }
    this.step6.get('trackingSupplier')?.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }

}
