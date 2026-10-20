import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lookupData } from '../../../core/modals';
import { LookupService } from '../../../_services/dataServices/lookup.service';
import { ImportModule } from '../../../core/import/import.module';
import { VMessageComponent } from '../../../core/v-message/v-message.component';
import { LbAutoCompleteComponent } from '../../../core/lb-auto-complete/lb-auto-complete.component';
import { DatePickerComponent } from '../../../core/date-picker/date-picker.component';

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [
    ImportModule,
    VMessageComponent,
    LbAutoCompleteComponent,
    DatePickerComponent,
  ],
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.scss',
})
export class PersonalDetailsComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  profile: any;
  selectRegion: lookupData[] = [];
  selectAccountType: lookupData[] = [];
  selectLanguage: lookupData[] = [];
  selectNationality: lookupData[] = [];
  selectDocumentType: lookupData[] = [];
  selectProvince: lookupData[] = [];
  constructor(
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
  ) {
    this.form = this.formBuilder.group({
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
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          ),
        ],
      ],
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
      bankName: ['', Validators.required],
      branchName: ['', Validators.required],
      branchCode: ['', Validators.required],
      accountNumber: ['', Validators.required],
      accountTypeId: ['', Validators.required],
      workForUs: [false],
      relativeOnCompany: [false],
    });

    this.getRegionLookup();
    this.getNationlityLookup();
    this.getLanguageLookup();
    this.getDocumentTypeLookup();
    this.getAccountTypeLookup();
  }
  ngOnInit(): void {}

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

  customRequired(formGroup: string, makeRequired: string, event?: any) {
    if (event) {
      if (this.getNameByValue('Number', event) == 'ID Number') {
        this.form.get('documentExpiryDate')?.clearValidators();
        this.form.get('documentExpiryDate')?.updateValueAndValidity();
      } else {
        this.form
          .get('documentExpiryDate')
          ?.setValidators([Validators.required]);
        this.form.get('documentExpiryDate')?.updateValueAndValidity();
      }
    } else {
      if (this.form.value[formGroup] == true) {
        this.form.get(makeRequired)?.setValidators([Validators.required]);
        this.form.get(makeRequired)?.updateValueAndValidity();
      } else {
        this.form.get(makeRequired)?.clearValidators();
        this.form.get(makeRequired)?.updateValueAndValidity();
      }
    }
  }

  setBooleanValue(field: 'workForUs' | 'relativeOnCompany', value: boolean) {
    this.form.patchValue({ [field]: value });
  }

  sameAs() {
    let formData = this.form.value;
    if (formData.sameAs == true) {
      this.form.patchValue({
        postalline1: formData?.line1,
        postalline2: formData?.line2,
        postalsuburb: formData?.suburb,
        postalzipCode: formData?.zipCode,
        postalregionId: formData?.regionId,
      });
    } else {
      this.form.patchValue({
        postalline1: '',
        postalline2: '',
        postalsuburb: '',
        postalzipCode: '',
        postalregionId: '',
      });
    }
  }
  submit() {}
  ngOnDestroy(): void {}
}
