import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../core/import/import.module';
import { BadgeColorService } from '../../../../_services/common/badgeColor.service';
import { CandidateInfo, lookupData } from '../../../../core/modals';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { LbAutoCompleteComponent } from '../../../../core/lb-auto-complete/lb-auto-complete.component';
import { DatePickerComponent } from '../../../../core/date-picker/date-picker.component';
import { ActivatedRoute, Router } from '@angular/router';
import { OffboardingService } from '../../../../_services/dataServices/offboarding.service';
import { Subscription } from 'rxjs';
import { LookupService } from '../../../../_services/dataServices/lookup.service';
import { changeDateToApiFormat } from '../../../../core/utility';

@Component({
  selector: 'app-new-offboarding',
  standalone: true,
  imports: [
    ImportModule,
    VMessageComponent,
    LbAutoCompleteComponent,
    DatePickerComponent,
  ],
  templateUrl: './new-offboarding.component.html',
  styleUrl: './new-offboarding.component.scss',
})
export class NewOffboardingComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  candidateInfo!: CandidateInfo;
  profileId!: string;
  offBoardingId!: string;
  pSub: Subscription | undefined;
  routeSub: Subscription | undefined;
  qSub: Subscription | undefined;
  selectReason: lookupData[] = [
    { name: 'Resignation', value: 'resignation' },
    { name: 'Performance Issues', value: 'performance issues' },
    { name: 'Personal Reasons', value: 'personal reasons' },
    { name: 'Restructuring', value: 'restructuring' },
  ];
  selectStatus: lookupData[] = [{ name: 'In Progress', value: 'in progress' }, { name: 'Completed', value: 'completed' }]
  selectRequirements: lookupData[] = [];
  selectedRequirements: string[] = [];
  view: string = '';
  constructor(
    public badgeColorService: BadgeColorService,
    private formBuilder: FormBuilder,
    private offBoardingService: OffboardingService,
    private router: Router,
    private route: ActivatedRoute,
    private lookupService: LookupService
  ) {
    this.form = this.formBuilder.group({
      offboardingReason: ['contractEnded'],
      payrollReason: ['', [Validators.required]],
      reason: ['', [Validators.required]],
      status: [''],
      customer: [''],
      site: [''],
      jobTitle: [''],
      startDate: [''],
      requirements: [''],
      endDate: [''],
      approved: [''],
      offboardingDate: [''],
    });
    this.getRequirementsLookup();
  }

  ngOnInit(): void {

    // Route params
    this.pSub = this.route.paramMap.subscribe(params => {
      this.offBoardingId = params.get('offBoardingId') ?? '';
    });
    // Detect mode from URL segments
    this.routeSub = this.route.url.subscribe(segments => {
      this.view = segments.some(s => s.path === 'view') ? 'view' : 'edit';
    });
    if (this.view == 'view') {
      this.form.disable();
    }

    if (this.offBoardingId != '') {
      this.getSingleOffboarding();
    }

    // Query params
    this.qSub = this.route.queryParamMap.subscribe(query => {
      this.profileId = query.get('profileId') ?? '';
    });

    if (this.profileId != null) {
      this.getCandidateInfo();
    }
  }

  setBooleanValue(field: string, value: string | boolean) {
    this.form.patchValue({ [field]: value });
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  goBack() {
    this.router.navigate
      (['/offBoarding']);
  }

  onChange(req: string, checked: boolean) {
    if (checked) {
      this.selectedRequirements = this.selectedRequirements || []
      this.selectedRequirements.push(req);
    } else {
      this.selectedRequirements = this.selectedRequirements?.filter((a: any) => a !== req);
    }
  }

  getSingleOffboarding() {
    const sub = this.offBoardingService
      .getSingleOffboarding(this.offBoardingId)
      .subscribe({
        next: (res) => {
          const data = res.data;
          this.form.patchValue({
            offboardingReason: data?.offboardingReason ?? '',
            payrollReason: data?.payrollReason ?? '',
            reason: data?.reason ?? '',
            requirements: data?.requirements ?? [],
            status: data?.status ?? '',
            endDate: data?.endDate ?? '',
            approved: data?.approved ?? '',
            offboardingDate: data?.offboardingDate ?? ''
          });
          this.selectedRequirements = data?.requirements ?? [];
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getCandidateInfo() {
    const sub = this.offBoardingService
      .getCandidateInfo({ profile_id: this.profileId })
      .subscribe({
        next: (res) => {
          this.candidateInfo = res.data;
          this.form.patchValue({
            customer: this.candidateInfo?.customerName ?? '',
            site: this.candidateInfo?.site ?? '',
            jobTitle: this.candidateInfo?.jobTitle ?? '',
            startDate: this.candidateInfo?.startDate ?? '',
            endDate: this.candidateInfo?.endDate ?? ''
          });
          this.form.get('startDate')?.disable();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getRequirementsLookup() {
    const sub = this.lookupService.getSettingsLookup('ClearanceTypes').subscribe({
      next: (res) => {
        this.selectRequirements = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      data.endDate = changeDateToApiFormat(data?.endDate);
      data.offboardingDate = changeDateToApiFormat(data?.offboardingDate);
      data.customerId = this.candidateInfo?.customerId;
      data.profileId = this.profileId;
      data.requirements = this.selectedRequirements ?? [];
      const keysToRemove = [
        'customer',
        'site',
        'jobTitle',
        'startDate'
      ];

      keysToRemove.forEach((key) => delete data[key]);
      if (this.offBoardingId != '') {
        const sub = this.offBoardingService.
          createOrUpdateOffboarding(data, this.offBoardingId)
          .subscribe({
            next: (res: any) => {
              this.router.navigate(
                ['/offBoarding'],
              );

              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {

        const sub = this.offBoardingService.
          createOrUpdateOffboarding(data)
          .subscribe({
            next: (res: any) => {
              this.router.navigate(
                ['/offBoarding'],
              );

              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      }
    }

  }

  ngOnDestroy(): void {
    this.qSub?.unsubscribe();
    this.pSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }
}
