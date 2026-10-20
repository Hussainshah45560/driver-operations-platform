import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AodsService } from '../../../../_services/dataServices/aods.service';
import { Aod, lookupData } from '../../../../core/modals';
import { Subscription } from 'rxjs';
import { ImportModule } from '../../../../core/import/import.module';
import { LbAutoCompleteComponent } from '../../../../core/lb-auto-complete/lb-auto-complete.component';
import { LookupService } from '../../../../_services/dataServices/lookup.service';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { DatePickerComponent } from '../../../../core/date-picker/date-picker.component';
import { changeDateToApiFormat } from '../../../../core/utility';
import { TemplateService } from '../../../../_services/dataServices/template.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SignComponent } from '../../../../core/sign/sign.component';
import { BadgeColorService } from '../../../../_services/common/badgeColor.service';

@Component({
  selector: 'app-new-aod',
  standalone: true,
  imports: [ImportModule, LbAutoCompleteComponent, VMessageComponent, DatePickerComponent, SignComponent],
  templateUrl: './new-aod.component.html',
  styleUrl: './new-aod.component.scss',
})
export class NewAodComponent implements OnInit {
  @Input() profileId: string = '';
  @Output() sendToParent = new EventEmitter<any>();
  form!: FormGroup;
  selectTemplate: lookupData[] = [];
  selectReason: lookupData[] = [];
  selectProfile: lookupData[] = [];
  selectAodType: lookupData[] = [];
  selectPaymentTerms: lookupData[] = [];
  selectWeekOrMonths: lookupData[] = [];
  id!: string;
  data!: Aod;
  signUrl!: string;
  params: Params = {};
  routSub: Subscription;
  templateData: any;
  selectWeekDays: lookupData[] = [{ name: 'Monday', value: 'monday' },
  { name: 'Tuesday', value: 'tuesday' },
  { name: 'Wednesday', value: 'wednesday' },
  { name: 'Thursday', value: 'thursday' },
  { name: 'Friday', value: 'friday' },
  { name: 'Saturday', value: 'saturday' },
  { name: 'Sunday', value: 'sunday' }];

  selectMonths: lookupData[] = [
    { name: "1st", value: "1st" },
    { name: "2nd", value: "2nd" },
    { name: "3rd", value: "3rd" },
    { name: "4th", value: "4th" },
    { name: "5th", value: "5th" },
    { name: "6th", value: "6th" },
    { name: "7th", value: "7th" },
    { name: "8th", value: "8th" },
    { name: "9th", value: "9th" },
    { name: "10th", value: "10th" },
    { name: "11th", value: "11th" },
    { name: "12th", value: "12th" },
    { name: "13th", value: "13th" },
    { name: "14th", value: "14th" },
    { name: "15th", value: "15th" },
    { name: "16th", value: "16th" },
    { name: "17th", value: "17th" },
    { name: "18th", value: "18th" },
    { name: "19th", value: "19th" },
    { name: "20th", value: "20th" },
    { name: "21st", value: "21st" },
    { name: "22nd", value: "22nd" },
    { name: "23rd", value: "23rd" },
    { name: "24th", value: "24th" },
    { name: "25th", value: "25th" },
    { name: "26th", value: "26th" },
    { name: "27th", value: "27th" },
    { name: "28th", value: "28th" },
    { name: "29th", value: "29th" },
    { name: "30th", value: "30th" },
    { name: "31st", value: "31st" }
  ];
  isDisabled: boolean = false;
  employeeId!: string;
  employeeData!: any;
  constructor(
    private formBuilder: FormBuilder,
    private aodsService: AodsService,
    private lookupService: LookupService,
    private route: ActivatedRoute,
    private router: Router,
    private templateService: TemplateService,
    private sanitizer: DomSanitizer,
    public badgeColorService: BadgeColorService
  ) {
    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      if (params['employeeId']) {
        this.employeeId = this.params['employeeId'];
        this.getProfileData(this.employeeId);
      }
      this.id = params['id'];
      if (this.id != null) {
        this.getSingleAod(this.id);
      }
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

    this.getReasonLookup();
    this.getPaymentTermsLookup();
    this.getTypeLookup();
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getSingleAod(id: string) {
    const sub = this.aodsService.getSingleAod(id).subscribe({
      next: (res) => {
        this.data = res.data;

        // if (this.data?.aodSign) {
        //   this.isDisabled = true;
        //   this.form.get('aodSignDate')?.disable();
        // }
        this.getProfileData(res.data.profileId);
        this.getTemplateData(this.data?.templateId);
        this.form.patchValue({
          profileId: this.data?.profileId ?? '',
          templateId: this.data?.templateId ?? '',
          paymentTermId: this.data?.paymentTermId ?? '',
          aodReasonId: this.data?.aodReasonId ?? '',
          aodTypeId: this.data?.aodTypeId ?? '',
          date: this.data?.date ?? '',
          amount: this.data?.amount ?? '',
          paymentDuration: this.data?.paymentDuration ?? '',
          weekOrMonth: this.data?.weekOrMonth ?? '',
          // aodSign: this.data?.aodSign ?? '',
          // aodSignDate: this.data.aodSignDate ?? ''
        });
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  ngOnInit(): void {
    if (this.profileId != '') {
      this.getProfileData(this.profileId);
    }
  }


  getTemplateData(id: string) {
    const sub = this.templateService.getTemplateType({ template_id: id }).subscribe({
      next: (res) => {
        this.templateData = this.sanitizer.bypassSecurityTrustHtml(res.data?.content || '');
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  patchSign(event: any) {
    this.signUrl = event;
    this.form.patchValue({
      aodSign: event
    })
  }

  getTemplateLookup() {
    const sub = this.lookupService.getSettingsLookup('CMCTemplates', { used_for: 'aod_template', customer_id: this.employeeData?.customerId }).subscribe({
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


  getProfileData(event: string) {
    const sub = this.aodsService.getProfileData(event).subscribe({
      next: (res) => {
        this.employeeData = res?.data;
        if (this.employeeData?.customerId) {
          this.getTemplateLookup()
        }
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
      data.profileId = this.employeeId ?? this.data?.profileId ?? this.profileId;
      // data.aodSign = this.signUrl;
      // data.aodSignDate = changeDateToApiFormat(data?.aodSignDate);
      if (this.id != '' && this.id != undefined) {
        const sub = this.aodsService
          .createOrUpdateAod(data, this.id)
          .subscribe({
            next: (res) => {
              this.router.navigate(['/aod/sign/' + this.id]);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {
        const sub = this.aodsService.createOrUpdateAod(data).subscribe({
          next: (res: any) => {
            if (!this.profileId) {
              this.router.navigate(['/aod/sign/' + res.data?.aodId]);
            } else {
              this.router.navigate(['/aod/sign/' + res.data?.aodId]);
              this.sendBackToParent();
            }

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

  sendBackToParent() {
    this.sendToParent.emit('close');
  }

}
