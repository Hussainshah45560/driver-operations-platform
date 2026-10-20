import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../../../core/import/import.module';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { DatePickerComponent } from '../../../../../core/date-picker/date-picker.component';
import { SignsComponent } from '../sign/sign.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lookupData } from '../../../../../core/modals';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { TemplateService } from '../../../../../_services/dataServices/template.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { DisciplinaryService } from '../../../../../_services/dataServices/disciplinary.service';
import { Subscription } from 'rxjs';
import { CandidateStateService } from '../../../../../_services/common/candidate-state.service';
import { changeDateToApiFormat } from '../../../../../core/utility';

@Component({
  selector: 'app-disciplinary-aod',
  standalone: true,
  imports: [
    ImportModule,
    LbAutoCompleteComponent,
    VMessageComponent,
    DatePickerComponent,
    SignsComponent,
  ],
  templateUrl: './disciplinary-aod.component.html',
  styleUrl: './disciplinary-aod.component.scss',
})
export class DisciplinaryAodComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  selectTemplate: lookupData[] = [];
  selectReason: lookupData[] = [];
  selectProfile: lookupData[] = [];
  selectAodType: lookupData[] = [];
  selectPaymentTerms: lookupData[] = [];
  selectWeekOrMonths: lookupData[] = [];
  id!: string;
  signUrl!: string;
  params: Params = {};
  // routSub: Subscription;
  templateData: any;
  selectWeekDays: lookupData[] = [
    { name: 'Monday', value: 'monday' },
    { name: 'Tuesday', value: 'tuesday' },
    { name: 'Wednesday', value: 'wednesday' },
    { name: 'Thursday', value: 'thursday' },
    { name: 'Friday', value: 'friday' },
    { name: 'Saturday', value: 'saturday' },
    { name: 'Sunday', value: 'sunday' },
  ];

  selectMonths: lookupData[] = [
    { name: '1st', value: '1st' },
    { name: '2nd', value: '2nd' },
    { name: '3rd', value: '3rd' },
    { name: '4th', value: '4th' },
    { name: '5th', value: '5th' },
    { name: '6th', value: '6th' },
    { name: '7th', value: '7th' },
    { name: '8th', value: '8th' },
    { name: '9th', value: '9th' },
    { name: '10th', value: '10th' },
    { name: '11th', value: '11th' },
    { name: '12th', value: '12th' },
    { name: '13th', value: '13th' },
    { name: '14th', value: '14th' },
    { name: '15th', value: '15th' },
    { name: '16th', value: '16th' },
    { name: '17th', value: '17th' },
    { name: '18th', value: '18th' },
    { name: '19th', value: '19th' },
    { name: '20th', value: '20th' },
    { name: '21st', value: '21st' },
    { name: '22nd', value: '22nd' },
    { name: '23rd', value: '23rd' },
    { name: '24th', value: '24th' },
    { name: '25th', value: '25th' },
    { name: '26th', value: '26th' },
    { name: '27th', value: '27th' },
    { name: '28th', value: '28th' },
    { name: '29th', value: '29th' },
    { name: '30th', value: '30th' },
    { name: '31st', value: '31st' },
  ];
  isDisabled: boolean = false;
  userId: string = '';
  disciplinaryId: string = '';
  customerId: string = '';
  profileId: string = '';
  sub: Subscription | undefined;
  candidateSub: Subscription | undefined;
  constructor(
    private formBuilder: FormBuilder,
    private disciplinaryService: DisciplinaryService,
    private lookupService: LookupService,
    private route: ActivatedRoute,
    private router: Router,
    private templateService: TemplateService,
    private sanitizer: DomSanitizer,
    public badgeColorService: BadgeColorService,
    private candidateStateService: CandidateStateService,
  ) {
    this.sub = this.route.parent?.params.subscribe(params => {
      this.params = params;
      this.disciplinaryId = params['disciplinaryId'];
    });

    this.form = this.formBuilder.group({
      templateId: ['', [Validators.required]],
      paymentTermId: ['', [Validators.required]],
      aodReasonId: ['', [Validators.required]],
      aodTypeId: ['', [Validators.required]],
      date: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      paymentDuration: ['weekly'],
      weekOrMonth: ['', [Validators.required]],
    });
    console.log(this.form.value)

    this.getReasonLookup();
    this.getPaymentTermsLookup();
    this.getTypeLookup();
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  ngOnInit(): void {
    this.profileId = this.route.parent?.snapshot.queryParamMap.get('profileId') ?? '';
    this.candidateSub = this.candidateStateService.candidateData$.subscribe(data => {
      this.userId = data?.userId ?? '';
      this.customerId = data?.customerId ?? '';
      if (this.customerId) {
        this.getTemplateLookup();
      }
    });
    this.getDisiplinaryAod();

  }

  getDisiplinaryAod() {
    const sub = this.disciplinaryService
      .getDisiplinaryAod(this.disciplinaryId)
      .subscribe({
        next: (res) => {
          this.form.patchValue({
            templateId: res.data?.templateId ?? '',
            paymentTermId: res.data?.paymentTermId ?? '',
            aodReasonId: res.data?.aodReasonId ?? '',
            aodTypeId: res.data?.aodTypeId ?? '',
            date: res.data?.date ?? '',
            amount: res.data?.amount ?? '',
            paymentDuration: res.data?.paymentDuration ?? '',
            weekOrMonth: res.data?.weekOrMonth ?? ''
          });
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getTemplateData(id: string) {
    const sub = this.templateService
      .getTemplateType({ template_id: id })
      .subscribe({
        next: (res) => {
          this.templateData = this.sanitizer.bypassSecurityTrustHtml(
            res.data?.content || ''
          );
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  patchSign(event: any) {
    this.signUrl = event;
    this.form.patchValue({
      aodSign: event,
    });
  }

  getTemplateLookup() {
    const sub = this.lookupService
      .getSettingsLookup('CMCTEmplates', { used_for: 'aod_template', customer_id: this.customerId })
      .subscribe({
        next: (res) => {
          this.selectTemplate = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getReasonLookup() {
    const sub = this.lookupService.getSettingsLookup('AODReasons').subscribe({
      next: (res) => {
        this.selectReason = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getPaymentTermsLookup() {
    const sub = this.lookupService.getSettingsLookup('PaymentTerms').subscribe({
      next: (res) => {
        this.selectPaymentTerms = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getTypeLookup() {
    const sub = this.lookupService.getSettingsLookup('AODTypes').subscribe({
      next: (res) => {
        this.selectAodType = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  setBooleanValue(field: string, value: string) {
    this.form.patchValue({ [field]: value });
  }


  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      data.date = changeDateToApiFormat(data?.date);
      data.profileId = this.profileId;
      if (this.disciplinaryId != '' && this.disciplinaryId != undefined) {
        const sub = this.disciplinaryService
          .createOrUpdateAod(data, this.disciplinaryId)
          .subscribe({
            next: (res) => {
              this.router.navigate(['/disciplinary']);
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
  goBack() {
    this.router.navigate(['disciplinary']);
  }

  ngOnDestroy(): void {
    this.candidateSub?.unsubscribe();
  }

}
