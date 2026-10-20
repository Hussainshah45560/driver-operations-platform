import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { lookupData, WarningList } from '../../../../../core/modals';
import { PaginationComponent } from '../../../../../core/pagination/pagination.component';
import { Subscription } from 'rxjs';
import { Pagination } from '../../../../../core/modals/pagination';
import { DatePickerComponent } from '../../../../../core/date-picker/date-picker.component';
import { DisciplinaryService } from '../../../../../_services/dataServices/disciplinary.service';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { changeDateToApiFormat } from '../../../../../core/utility';
import moment from 'moment';
import { PaginationService } from '../../../../../_services/common/pagination.service';
import { CandidateStateService } from '../../../../../_services/common/candidate-state.service';
import { FileSaverService } from '../../../../../_services/common/fileSaver.service';

@Component({
  selector: 'app-log-request',
  standalone: true,
  imports: [
    ImportModule,
    VMessageComponent,
    LbAutoCompleteComponent,
    PaginationComponent,
    DatePickerComponent
  ],
  templateUrl: './log-request.component.html',
  styleUrl: './log-request.component.scss',
})
export class LogRequestComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  selectRequestType: lookupData[] = [];
  selectAuthorisedBy: lookupData[] = [];
  selectCustomer: lookupData[] = [];
  selectWarningReasons: lookupData[] = [];
  pager: Pagination | any;
  qSub!: Subscription;
  queryParams: Params = {};
  disciplinaryId: string = '';
  profileId!: string;
  params: Params = {};
  sub: Subscription | undefined;
  warningsList!: WarningList[];
  moment = moment;
  candidateSub: Subscription | undefined;
  applicationCategory: string = '';
  customerId: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public badgeColorService: BadgeColorService,
    private disciplinaryService: DisciplinaryService,
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private pagination: PaginationService,
    private candidateStateService: CandidateStateService,
    private fileSaverService: FileSaverService
  ) {
    this.sub = this.route.parent?.params.subscribe(params => {
      this.params = params;
      this.disciplinaryId = params['disciplinaryId'];
      if (this.disciplinaryId != null) {
        this.getWarningsData();
      }
    });
    this.form = this.formBuilder.group({
      requestTypeId: ['', Validators.required],
      warningReasonId: ['', Validators.required],
      authorizedBy: [''],
      authorizedDate: [''],
      isFinalWarning: [false],
      isAuthorized: [false],
      customerId: ['', Validators.required],
      date: ['', Validators.required]
    });
    this.getAutherisedByLookup();

    this.getWarningReasonsLookup();
    this.getCustomerLookup();
  }

  ngOnInit(): void {
    this.profileId = this.route.parent?.snapshot.queryParamMap.get('profileId') ?? '';
    this.candidateSub = this.candidateStateService.candidateData$.subscribe(data => {
      this.applicationCategory = data?.applicationCategory ?? '';
      this.customerId = data?.customerId ?? '';
      if (this.customerId && this.applicationCategory) {
        this.getRequestTypeLookup();
      }
    });


  }

  sort(field: string, order: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderby: field, orderdir: order },
      queryParamsHandling: 'merge',
    });
  }

  setBooleanValue(field: string, value: boolean) {
    this.form.patchValue({ [field]: value });
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getWarningsData() {
    const sub = this.disciplinaryService.getWarningsData(this.disciplinaryId).subscribe({
      next: (res) => {
        this.warningsList = res.data?.warnings ?? [];
        this.form.patchValue({
          warningReasonId: res.data?.warningReasonId ?? ''
        })
        this.form.get('warningReasonId')?.disable();
        this.pager = this.pagination.compile(res.pagination);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }


  getRequestTypeLookup() {
    const sub = this.lookupService.getSettingsLookup('DisciplinaryTypes', { type: this.applicationCategory, customer_id: this.customerId }).subscribe({
      next: (res) => {
        this.selectRequestType = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getCustomerLookup() {
    const sub = this.lookupService.getSettingsLookup('Customers').subscribe({
      next: (res) => {
        this.selectCustomer = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getWarningReasonsLookup() {
    const sub = this.lookupService.getSettingsLookup('WarningReasons').subscribe({
      next: (res) => {
        this.selectWarningReasons = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getAutherisedByLookup() {
    const sub = this.lookupService.getSettingsLookup('Admins').subscribe({
      next: (res) => {
        this.selectAuthorisedBy = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  customRequired(required: boolean, arr: string[]) {
    const fields = arr;
    fields.forEach(field => {
      const control = this.form.get(field);
      if (control) {
        const existingValidators = control.validator ? [control.validator] : [];
        if (required == true) {
          control.setValidators([...existingValidators, Validators.required]);
        } else {
          control.clearValidators();
          if (field === 'mobilePhone' || field === 'homePhone') {
            control.setValidators([Validators.pattern(/^\+?[0-9]\d{9,14}$/)]);
          }
        }

        control.updateValueAndValidity();
      }
    });
  }

  getNameByValue(value: string, arr: lookupData[]): string | undefined {
    const selectedArray = arr;
    const match = selectedArray.find((item) => item.value === value);
    return match ? match.name : undefined;
  }

  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      data.profileId = this.profileId;
      data.date = changeDateToApiFormat(data?.date);
      if (data.authorizedDate != '') {
        data.authorizedDate = changeDateToApiFormat(data?.authorizedDate);
      }
      if (this.disciplinaryId != '' && this.disciplinaryId != undefined) {
        const sub = this.disciplinaryService.
          saveLogRequest(data, this.disciplinaryId)
          .subscribe({
            next: (res: any) => {
              this.router.navigate(
                ['/disciplinary', this.disciplinaryId, 'sign'],
                {
                  queryParams: { profileId: this.profileId },
                  queryParamsHandling: 'merge'
                }
              );

              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {

        const sub = this.disciplinaryService.
          saveLogRequest(data)
          .subscribe({
            next: (res: any) => {
              this.router.navigate(
                ['/disciplinary', res.data.disciplinaryId, 'sign'],
                {
                  queryParams: { profileId: this.profileId },
                  queryParamsHandling: 'merge'
                }
              );

              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      }

    } else {

    }
  }

  downloadFile(warningNumber: string) {
    const sub = this.disciplinaryService.downloadContract({ warning_number: warningNumber, disciplinary_id: this.disciplinaryId }).subscribe({
      next: (res: any) => {
        this.fileSaverService.downloadFile(res.data.url, res.data.templateName);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.candidateSub?.unsubscribe();
  }
}
