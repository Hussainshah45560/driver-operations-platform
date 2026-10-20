import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePickerComponent } from '../../../../../core/date-picker/date-picker.component';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { ImportModule } from '../../../../../core/import/import.module';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApplicationsService } from '../../../../../_services/dataServices/applications.service';
import { lookupData } from '../../../../../core/modals';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { changeDateToApiFormat } from '../../../../../core/utility';
import { AuthService } from '../../../../../_services/common/auth.service';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { StatusCheckService } from '../../../../../_services/dataServices/statusCheck.service';
import { ScrollService } from '../../../../../_services/common/scroll.service';

@Component({
  selector: 'app-step5',
  standalone: true,
  imports: [
    ImportModule,
    VMessageComponent,
    LbAutoCompleteComponent,
    DatePickerComponent,
  ],
  templateUrl: './step5.component.html',
  styleUrl: './step5.component.scss',
})
export class Step5Component implements OnInit, OnDestroy {
  step5!: FormGroup;
  stepStatus!: string;
  isView: boolean = false;
  step5Changes: any;
  params: Params = {};
  sub: Subscription | undefined;
  id!: string;
  selectLicenseCode: lookupData[] = [];
  selectSkills: lookupData[] = [];
  selectedSkills: string[] = [];
  selectedAreas: string[] = [];
  selectAreaOfEmployments: lookupData[] = [];
  stepData: any;
  role!: string;
  approvalForm: FormGroup;
  rejected: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private appilcationService: ApplicationsService,
    private route: ActivatedRoute,
    private router: Router,
    private lookupService: LookupService,
    private authService: AuthService,
    private scrollService: ScrollService,
    public badgeColorService: BadgeColorService,
    public statusCheckService: StatusCheckService
  ) {
    this.step5 = this.formBuilder.group({
      applicationType: ['driver'],
      hasLicense: [false],
      endorsements: [false],
      vehicleOwned: [false],
      areaIds: [''],
      licenseNumber: [''],
      licenseCodeIds: [''],
      issuedDate: [''],
      licenseExpiry: [''],
      prdpExpiry: [''],
      drivingExperience: [''],
      anyAccidents: [''],
      licenseSuspended: [''],
      medicationCondition: ['', [Validators.required]],
      medication: ['', [Validators.required]],
      jobPosition: [''],
      skillIds: [''],
    });
    this.approvalForm = this.formBuilder.group({
      reason: [''],
    });
    if (this.step5.value.applicationType == 'driver') {
      this.customRequired(true, [
        'licenseNumber',
        'drivingExperience',
        'areaIds',
        'licenseCodeIds',
        'issuedDate',
        'licenseExpiry',
        'anyAccidents',
        'licenseSuspended',
        'medicationCondition',
        'medication',
      ]);
    } else {
      this.customRequired(true, ['skillIds', 'areaIds', 'jobPosition', 'medicationCondition', 'medication']);
    }

    this.role = this.authService.userDetails?.role?.name ?? '';
    this.getSkillsLookup();
    this.getLicenseCodeLookup();
    this.sub = this.route.parent?.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getStepData();
      }
    });
  }
  ngOnInit(): void {
    const url = this.router.url;
    if (url.includes('view')) {
      this.isView = true;
      this.step5.disable();
    }

  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  approveStep(status: string) {
    const data = Object.assign({});
    if (this.approvalForm.value.reason != '') {
      data.reason = this.approvalForm.value.reason;
    }
    data.status = status;
    const sub = this.appilcationService
      .approveStep(this.id, data, 'Step5')
      .subscribe({
        next: (res) => {
          const nextStep = this.stepData?.applicationType === 'other' ? 'step7' : 'step6';
          this.router.navigate(['/applications/view/' + this.id + '/' + nextStep]);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }
  showSelectedValues(event: any, formGroup: string) {
    if (formGroup == 'skills' && event.length <= 5) {
      this.selectedSkills = event;
    } else if (formGroup == 'areas') {
      this.selectedAreas = event;
    }
  }

  getNameByValue(value: string, arr: lookupData[]): string | undefined {
    const selectedArray = arr;
    const match = selectedArray.find((item) => item.value === value);
    return match ? match.name : undefined;
  }

  getSkillsLookup() {
    const sub = this.lookupService.getSettingsLookup('Skills').subscribe({
      next: (res) => {
        this.selectSkills = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }
  getAreasLookup(id: string) {
    const sub = this.lookupService
      .getSettingsLookup('Areas', { region_id: id })
      .subscribe({
        next: (res) => {
          this.selectAreaOfEmployments = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }
  getLicenseCodeLookup() {
    const sub = this.lookupService.getSettingsLookup('LicenseCodes').subscribe({
      next: (res) => {
        this.selectLicenseCode = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getStepData() {
    const sub = this.appilcationService.getStepData('5', this.id).subscribe({
      next: (res) => {
        this.stepData = res.data;
        if (!this.statusCheckService.isStepValid('editable', this.stepData?.stepStatus?.step5, this.stepData?.applicationStatus)
        ) {
          this.router.navigate(['/applications/view/' + this.id + '/step5']);
        }
        this.getAreasLookup(this.stepData.regionId);
        if (this.stepData.stepStatus.step5 == 'changed') {
          this.step5.disable();
        }
        if (this.stepData && this.stepData?.step5Changes) {
          this.step5Changes = this.stepData?.step5Changes;
        }
        this.step5.patchValue({
          applicationType: this.stepData?.applicationType ?? 'driver',
          hasLicense: this.stepData?.driverDetails?.hasLicense ?? false,
          endorsements: this.stepData?.driverDetails?.endorsements ?? false,
          vehicleOwned: this.stepData?.driverDetails?.vehicleOwned ?? false,
          licenseNumber: this.stepData?.driverDetails?.licenseNumber ?? '',
          licenseCodeIds: this.stepData?.driverDetails?.licenseCodeIds ?? '',
          issuedDate: this.stepData?.driverDetails?.issuedDate ?? '',
          licenseExpiry: this.stepData?.driverDetails?.licenseExpiry ?? '',
          prdpExpiry: this.stepData?.driverDetails?.prdpExpiry ?? '',
          drivingExperience:
            this.stepData?.driverDetails?.drivingExperience ?? '',
          anyAccidents: this.stepData?.driverDetails?.anyAccidents ?? '',
          licenseSuspended:
            this.stepData?.driverDetails?.licenseSuspended ?? '',
          medicationCondition:
            this.stepData?.driverDetails?.medicationCondition ?? '',
          medication: this.stepData?.driverDetails?.medication ?? '',
          jobPosition: this.stepData?.driverDetails?.jobPosition ?? '',
          skillIds: this.stepData?.driverDetails?.skillIds ?? '',
          areaIds: this.stepData?.driverDetails?.areaIds ?? '',
        });
        this.selectedSkills = this.stepData?.driverDetails?.skillIds;
        this.selectedAreas = this.stepData?.driverDetails?.areaIds;
        if (this.stepData?.applicationType == 'driver') {
          this.customRequired(true, [
            'licenseNumber',
            'drivingExperience',
            'areaIds',
            'licenseCodeIds',
            'issuedDate',
            'licenseExpiry',
            'anyAccidents',
            'licenseSuspended',
            'medicationCondition',
            'medication',
          ]);
        }
        else if (this.stepData?.applicationType == 'other') {
          this.customRequired(true, ['skillIds', 'areaIds', 'jobPosition', 'medicationCondition', 'medication']);
        }
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  setBooleanValue(field: string, value?: string | boolean) {
    this.step5.patchValue({ [field]: value });
  }

  goBack() {
    this.router.navigate([
      '/applications/' + (this.isView ? 'view/' : 'edit/') + this.id + '/step4',
    ]);
  }

  submit() {
    if (this.step5.valid) {
      let data = Object.assign({}, this.step5.value);
      if (data.applicationType == 'driver') {
        data.issuedDate = changeDateToApiFormat(data.issuedDate);
        data.prdpExpiry = changeDateToApiFormat(data.prdpExpiry);
        data.licenseExpiry = changeDateToApiFormat(data.licenseExpiry);
      }
      data.skillIds = data.skillIds || [];
      data.licenseCodeIds = data.licenseCodeIds || [];
      if (data.prdpExpiry == '' || data.prdpExpiry == null) {
        delete data.prdpExpiry;
      }
      if (this.id) {
        const sub = this.appilcationService
          .createOrUpdateSteps(data, 'Step5', this.id)
          .subscribe({
            next: (res) => {
              if (data.applicationType == 'other') {
                this.router.navigate([
                  '/applications/edit/' + this.id + '/step7',
                ]);
              } else {
                this.router.navigate([
                  '/applications/edit/' + this.id + '/step6',
                ]);
              }

              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      }
    } else {
      this.step5.markAllAsTouched();
      this.scrollService.scrollToFirstInvalid()
    }
  }

  customRequired(required: boolean, arr: string[]) {
    const allControls = Object.keys(this.step5.controls);
    console.log(arr, 'arr')
    allControls.forEach((field) => {
      const control = this.step5.get(field);
      if (!control) return;

      if (arr.includes(field) && required) {
        const existingValidators = control.validator ? [control.validator] : [];
        control.setValidators([...existingValidators, Validators.required]);
      } else {
        control.clearValidators();
        if (field === 'mobilePhone' || field === 'homePhone') {
          control.setValidators([Validators.pattern(/^\+?[0-9]\d{9,14}$/)]);
        }
      }

      control.updateValueAndValidity({ onlySelf: true });
    });
  }

  onChange(value: string, checked: boolean) {
    if (!checked) {
      this.selectedSkills = this.selectedSkills.filter((item) => item != value);
    }
    const skills = this.step5.get('skillIds')?.value || [];

    const updated = skills.filter((item: string) => item !== value);

    this.step5.get('skillIds')?.setValue(updated);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
