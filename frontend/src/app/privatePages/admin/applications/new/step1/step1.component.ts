import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { DatePickerComponent } from '../../../../../core/date-picker/date-picker.component';
import { ApplicationsService } from '../../../../../_services/dataServices/applications.service';
import { lookupData, User } from '../../../../../core/modals';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { changeDateToApiFormat } from '../../../../../core/utility';
import { AuthService } from '../../../../../_services/common/auth.service';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { StatusCheckService } from '../../../../../_services/dataServices/statusCheck.service';
import { UsersService } from '../../../../../_services/dataServices/users.service';
import { ScrollService } from '../../../../../_services/common/scroll.service';
@Component({
  selector: 'app-step1',
  standalone: true,
  imports: [
    ImportModule,
    VMessageComponent,
    LbAutoCompleteComponent,
    DatePickerComponent,
  ],
  templateUrl: './step1.component.html',
  styleUrl: './step1.component.scss',
})
export class Step1Component implements OnInit, OnDestroy {
  params: Params = {};
  sub: Subscription | undefined;
  step1!: FormGroup;
  profile: any;
  selectRegion: lookupData[] = [];
  selectAccountType: lookupData[] = [];
  selectLanguage: lookupData[] = [];
  selectNationality: lookupData[] = [];
  selectDocumentType: lookupData[] = [];
  selectProvince: lookupData[] = [];
  selectBank: lookupData[] = [];
  id!: string;
  profileId!: string;
  isView: boolean = false;
  step1Changes: any;
  stepData: any;
  role!: string;
  approvalForm: FormGroup;
  rejected: boolean = false;
  userData!: User;
  constructor(
    private formBuilder: FormBuilder,
    private appilcationService: ApplicationsService,
    private lookupService: LookupService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    public badgeColorService: BadgeColorService,
    public statusCheckService: StatusCheckService,
    private usersService: UsersService,
    private scrollService: ScrollService
  ) {

    this.step1 = this.formBuilder.group({
      userName: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\+?[0-9]\d{9,14}$/)],
      ],
      alternativeNumber: ['', [Validators.pattern(/^\+?[0-9]\d{9,14}$/)]],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      dateOfBirth: ['', Validators.required],
      nationalityId: ['', Validators.required],
      nativeLanguageId: ['', Validators.required],
      additionalLanguageIds: [''],
      documentTypeId: ['', Validators.required],
      idNumber: ['', Validators.required],
      documentExpiryDate: [''],
      workAddress: [''],
      relativeDetails: [''],
      line1: ['', Validators.required],
      line2: [''],
      suburb: ['', Validators.required],
      zipCode: ['', Validators.required],
      regionId: ['', Validators.required],
      postalline1: ['', Validators.required],
      postalline2: [''],
      postalsuburb: ['', Validators.required],
      postalzipCode: ['', Validators.required],
      postalregionId: ['', Validators.required],
      sameAs: [false],
      bankNameId: ['', Validators.required],
      branchName: ['', Validators.required],
      branchCode: ['', Validators.required],
      accountNumber: ['', Validators.required],
      accountTypeId: ['', Validators.required],
      workForUs: [false],
      relativeOnCompany: [false],
    });
    this.approvalForm = this.formBuilder.group({
      reason: [''],
    });
    this.sub = this.route.parent?.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getStepData();
      }
    });
    this.role = this.authService.userDetails?.role?.name ?? '';
    if (this.role == 'Applicant') {
      this.getProfileData();
    }
    this.getRegionLookup();
    this.getBankLookup();
    this.getNationlityLookup();
    this.getLanguageLookup();
    this.getDocumentTypeLookup();
    this.getAccountTypeLookup();
  }
  ngOnInit(): void {
    const url = this.router.url;
    if (url.includes('view')) {
      this.isView = true;
      this.step1.disable();
    }
  }

  getProfileData() {
    const sub = this.usersService.getProfileData().subscribe({
      next: (res) => {
        this.userData = res.data;
        this.step1.patchValue({
          firstName: this.userData?.firstName ?? '',
          lastName: this.userData?.lastName ?? '',
          userName: this.userData?.userName ?? '',
          email: this.userData?.email ?? '',
          phoneNumber: this.userData?.phoneNumber ?? '',
          alternativeNumber: this.userData?.alternativeNumber ?? '',
          line1: this.userData?.physicalAddress?.line1 ?? '',
          line2: this.userData?.physicalAddress?.line2 ?? '',
          suburb: this.userData?.physicalAddress?.suburb ?? '',
          zipCode: this.userData?.physicalAddress?.zipCode ?? '',
          regionId: this.userData?.physicalAddress?.regionId ?? '',
          postalline1: this.userData?.postalAddress?.line1 ?? '',
          postalline2: this.userData?.postalAddress?.line2 ?? '',
          postalsuburb: this.userData?.postalAddress?.suburb ?? '',
          postalzipCode: this.userData?.postalAddress?.zipCode ?? '',
          postalregionId: this.userData?.postalAddress?.regionId ?? '',
          sameAs: this.userData?.postalAddress?.sameAsPhysicalAddress ?? false,
        });
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getStepData() {
    const sub = this.appilcationService.getStepData('1', this.id).subscribe({
      next: (res) => {
        this.stepData = res.data;
        if (!this.statusCheckService.isStepValid('editable', this.stepData?.stepStatus?.step1, this.stepData?.applicationStatus)
        ) {
          this.router.navigate(['/applications/view/' + this.id + '/step1']);
        }
        this.profileId = this.stepData.profileId;
        if (this.stepData.stepStatus.step1 == 'changed') {
          this.step1.disable();
        }
        if (this.stepData && this.stepData?.step1Changes) {
          this.step1Changes = this.stepData?.step1Changes;
        }

        this.step1.patchValue({
          userName: this.stepData.userName ?? '',
          firstName: this.stepData.firstName ?? '',
          lastName: this.stepData.lastName ?? '',
          phoneNumber: this.stepData.phoneNumber ?? '',
          alternativeNumber: this.stepData.alternativeNumber ?? '',
          email: this.stepData.email ?? '',
          dateOfBirth: this.stepData.dateOfBirth ?? '',
          nationalityId: this.stepData.nationalityId ?? '',
          nativeLanguageId: this.stepData.nativeLanguageId ?? '',
          additionalLanguageIds: this.stepData.additionalLanguageIds ?? '',
          documentTypeId: this.stepData.documentTypeId ?? '',
          idNumber: this.stepData.idNumber ?? '',
          documentExpiryDate: this.stepData.documentExpiryDate ?? '',
          workAddress: this.stepData.employmentInfo.workAddress ?? '',
          relativeDetails: this.stepData.employmentInfo.relativeDetails ?? '',
          line1: this.stepData.physicalAddress.line1 ?? '',
          line2: this.stepData.physicalAddress.line2 ?? '',
          suburb: this.stepData.physicalAddress.suburb ?? '',
          zipCode: this.stepData.physicalAddress.zipCode ?? '',
          regionId: this.stepData.physicalAddress.regionId ?? '',
          postalline1: this.stepData.postalAddress.line1 ?? '',
          postalline2: this.stepData.postalAddress.line2 ?? '',
          postalsuburb: this.stepData.postalAddress.suburb ?? '',
          postalzipCode: this.stepData.postalAddress.zipCode ?? '',
          postalregionId: this.stepData.postalAddress.regionId ?? '',
          sameAs: this.stepData.postalAddress.sameAsPhysicalAddress ?? false,
          bankNameId: this.stepData.bankDetails.bankNameId ?? '',
          branchName: this.stepData.bankDetails.branchName ?? '',
          branchCode: this.stepData.bankDetails.branchCode ?? '',
          accountNumber: this.stepData.bankDetails.accountNumber ?? '',
          accountTypeId: this.stepData.bankDetails.accountTypeId ?? '',
          workForUs: this.stepData.employmentInfo.workForUs ?? false,
          relativeOnCompany:
            this.stepData.employmentInfo.relativeOnCompany ?? false,
        });
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  compareStringArrays(oldArr: string[], newArr: string[]) {
    const added = newArr.filter((item) => !oldArr.includes(item));
    const removed = oldArr.filter((item) => !newArr.includes(item));

    return { added, removed };
  }

  setBooleanValue(field: 'workForUs' | 'relativeOnCompany', value: boolean) {
    this.step1.patchValue({ [field]: value });
  }

  getRegionLookup() {
    const sub = this.lookupService.getSettingsLookup('Regions').subscribe({
      next: (res) => {
        this.selectRegion = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }
  getBankLookup() {
    const sub = this.lookupService.getSettingsLookup('Banks').subscribe({
      next: (res) => {
        this.selectBank = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  patchBranchCode(event: any) {
    let obj = this.selectBank.find(i => i.value === event);
    this.step1.patchValue({
      branchCode: obj?.code ?? ''
    })
  }

  getAccountTypeLookup() {
    const sub = this.lookupService.getSettingsLookup('AccountType').subscribe({
      next: (res) => {
        this.selectAccountType = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getNationlityLookup() {
    const sub = this.lookupService.getSettingsLookup('Nationality').subscribe({
      next: (res) => {
        this.selectNationality = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getLanguageLookup() {
    const sub = this.lookupService.getSettingsLookup('Languages').subscribe({
      next: (res) => {
        this.selectLanguage = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getDocumentTypeLookup() {
    const sub = this.lookupService
      .getSettingsLookup('DocumentType', { type: 'Profile' })
      .subscribe({
        next: (res) => {
          this.selectDocumentType = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  sameAs() {
    let formData = this.step1.value;
    if (formData.sameAs == true) {
      this.step1.patchValue({
        postalline1: formData?.line1,
        postalline2: formData?.line2,
        postalsuburb: formData?.suburb,
        postalzipCode: formData?.zipCode,
        postalregionId: formData?.regionId,
      });
    } else {
      this.step1.patchValue({
        postalline1: '',
        postalline2: '',
        postalsuburb: '',
        postalzipCode: '',
        postalregionId: '',
      });
    }
  }

  approveStep(status: string) {
    const data = Object.assign({});
    if (this.approvalForm.value.reason != '') {
      data.reason = this.approvalForm.value.reason;
    }
    data.status = status;
    const sub = this.appilcationService
      .approveStep(this.id, data, 'Step1')
      .subscribe({
        next: (res) => {
          this.router.navigate(['/applications/view/' + this.id + '/step2']);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  submit() {
    if (this.step1.valid) {
      const data = Object.assign({}, this.step1.value);
      data.documentExpiryDate = changeDateToApiFormat(data.documentExpiryDate);
      data.dateOfBirth = changeDateToApiFormat(data.dateOfBirth);
      data.physicalAddress = {
        line1: data.line1,
        line2: data.line2,
        suburb: data.suburb,
        regionId: data.regionId,
        zipCode: data.zipCode,
      };
      data.postalAddress = {
        sameAsPhysicalAddress: data.sameAs,
        line1: data.postalline1,
        line2: data.postalline2,
        suburb: data.postalsuburb,
        regionId: data.postalregionId,
        zipCode: data.postalzipCode,
      };
      data.bankDetails = {
        bankNameId: data.bankNameId,
        accountNumber: data.accountNumber,
        accountTypeId: data.accountTypeId,
        branchCode: data.branchCode,
        branchName: data.branchName,
      };
      data.employmentInfo = {
        workForUs: data.workForUs,
        workAddress: data.workAddress,
        relativeOnCompany: data.relativeOnCompany,
        relativeDetails: data.relativeDetails,
      };
      const keysToRemove = [
        'workForUs',
        'workAddress',
        'relativeOnCompany',
        'relativeDetails',
        'bankNameId',
        'branchName',
        'accountNumber',
        'accountTypeId',
        'branchCode',
        'branchNameId',
        'postalline1',
        'postalline2',
        'postalsuburb',
        'postalregionId',
        'postalzipCode',
        'line1',
        'line2',
        'sameAs',
        'suburb',
        'regionId',
        'zipCode',
        'areaOfEmployment',
      ];
      keysToRemove.forEach((key) => delete data[key]);
      if (this.id) {
        data.profileId = this.profileId;
        const sub = this.appilcationService
          .createOrUpdateSteps(data, 'Step1', this.id)
          .subscribe({
            next: (res) => {
              this.router.navigate([
                '/applications/edit/' + this.id + '/step2',
              ]);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {
        const sub = this.appilcationService
          .createOrUpdateSteps(data, 'Step1')
          .subscribe({
            next: (res: any) => {
              this.id = res.data?.applicationId;
              this.router.navigate([
                '/applications/edit/' + this.id + '/step2',
              ]);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      }
    } else {
      this.step1.markAllAsTouched();
      this.scrollService.scrollToFirstInvalid();
    }
  }

  edit() {
    this.router.navigate(['/applications/edit/' + this.id + '/step1']);
  }

  getNameByValue(formGroup: string, value: string): string | undefined {
    const match = this.selectDocumentType.find((item) => item.value === value);
    if (match) {
      if (match.name == 'Application for Work Permit') {
        if (formGroup == 'expiry') {
          return 'Application';
        } else {
          return 'Application number';
        }
      } else {
        return match.name + ' ' + formGroup;
      }
    } else {
      return formGroup;
    }
  }

  customRequired(formGroup: string, makeRequired: string, event?: any) {
    if (event) {
      if (this.getNameByValue('Number', event) == 'ID Number') {
        this.step1.get('documentExpiryDate')?.clearValidators();
        this.step1.get('documentExpiryDate')?.updateValueAndValidity();
      } else {
        this.step1
          .get('documentExpiryDate')
          ?.setValidators([Validators.required]);
        this.step1.get('documentExpiryDate')?.updateValueAndValidity();
      }
    } else {
      if (this.step1.value[formGroup] == true) {
        this.step1.get(makeRequired)?.setValidators([Validators.required]);
        this.step1.get(makeRequired)?.updateValueAndValidity();
      } else {
        this.step1.get(makeRequired)?.clearValidators();
        this.step1.get(makeRequired)?.updateValueAndValidity();
      }
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
