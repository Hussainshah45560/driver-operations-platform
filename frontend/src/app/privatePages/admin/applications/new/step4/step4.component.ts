import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePickerComponent } from '../../../../../core/date-picker/date-picker.component';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { ImportModule } from '../../../../../core/import/import.module';
import { ExperienceComponent } from './experience/experience.component';
import { MatDialog } from '@angular/material/dialog';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApplicationsService } from '../../../../../_services/dataServices/applications.service';
import { EmploymentHistoryService } from '../../../../../_services/dataServices/employmentHistory.service';
import { EmploymentHistory, lookupData } from '../../../../../core/modals';
import moment from 'moment';
import { AuthService } from '../../../../../_services/common/auth.service';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { StatusCheckService } from '../../../../../_services/dataServices/statusCheck.service';
import { ScrollService } from '../../../../../_services/common/scroll.service';

@Component({
  selector: 'app-step4',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent, DatePickerComponent],
  templateUrl: './step4.component.html',
  styleUrl: './step4.component.scss'
})
export class Step4Component implements OnInit, OnDestroy {
  step4!: FormGroup;
  stepStatus!: string;
  isView: boolean = false;
  step4Changes: any;
  params: Params = {};
  sub: Subscription | undefined;
  id!: string;
  selectBenfits: lookupData[] = [];
  selectedBenefits: string[] = [];
  addedEmploymentAreas: string[] = [];
  removedEmploymentAreas: string[] = [];
  employmentHistory: EmploymentHistory[] = [];
  employmentHistoryIds: string[] = [];
  moment = moment;
  showInput: boolean = false;
  stepData: any;
  role!: string;
  approvalForm: FormGroup;
  rejected: boolean = false;
  addedBenefits: any;
  removedBenefits: any;
  constructor(
    private formBuilder: FormBuilder,
    private appilcationService: ApplicationsService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private lookupService: LookupService,
    private employmentHistoryService: EmploymentHistoryService,
    private authService: AuthService,
    public badgeColorService: BadgeColorService,
    public statusCheckService: StatusCheckService,
    private scrollService: ScrollService
  ) {

    this.step4 = this.formBuilder.group({
      jobDescription: ['', Validators.required],
      dismissedFromJob: [false],
      employersDismissalEndorsement: [''],
      reasonForDismissal: [''],
      benefits: [''],
      otherBenefit: ['']
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
    this.getBenefitsLookup();
    this.getAllEmploymentHistory();
  }
  ngOnInit(): void {
    const url = this.router.url;
    if (url.includes('view')) {
      this.isView = true;
      this.step4.disable();
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
    const sub = this.appilcationService
      .approveStep(this.id, data, 'Step4')
      .subscribe({
        next: (res) => {
          this.router.navigate(['/applications/view/' + this.id + '/step5']);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }
  getStepData() {
    const sub = this.appilcationService
      .getStepData('4', this.id)
      .subscribe({
        next: (res) => {
          this.stepData = res.data;
          if (!this.statusCheckService.isStepValid('editable', this.stepData?.stepStatus?.step4, this.stepData?.applicationStatus)
          ) {
            this.router.navigate(['/applications/view/' + this.id + '/step4']);
          }
          if (this.stepData.stepStatus.step4 == 'changed') {
            this.step4.disable();
          }
          if (this.stepData && this.stepData?.step4Changes) {
            this.step4Changes = this.stepData?.step4Changes;
            if (this.step4Changes?.benefitIds) {
              const oldArr = this.stepData?.currentEmployment?.benefitIds || [];
              const newArr = this.step4Changes?.benefitIds || [];
              const { added, removed } = this.compareStringArrays(oldArr, newArr);
              this.addedBenefits = added;
              this.removedBenefits = removed;
            } else {
              this.addedBenefits = [];
              this.removedBenefits = [];
            }
          }
          this.selectedBenefits = this.stepData?.currentEmployment?.benefitIds;
          this.step4.patchValue({
            jobDescription: this.stepData?.currentEmployment?.jobDescription ?? '',
            dismissedFromJob: this.stepData?.currentEmployment?.dismissedFromJob ?? false,
            employersDismissalEndorsement: this.stepData?.currentEmployment?.employersDismissalEndorsement ?? '',
            reasonForDismissal: this.stepData?.currentEmployment?.reasonForDismissal ?? '',
            benefits: this.stepData?.currentEmployment?.benefitIds ?? [],
            otherBenefit: this.stepData?.currentEmployment?.otherBenefit ?? ''
          });
          if (this.stepData?.currentEmployment?.otherBenefit != null) {
            this.showInput = true
          }
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  compareStringArrays(oldArr: string[], newArr: string[]) {
    const added = newArr.filter(item => !oldArr.includes(item));
    const removed = oldArr.filter(item => !newArr.includes(item));

    return { added, removed };
  }


  onChange(benefit: string, checked: boolean) {
    if (checked) {
      this.selectedBenefits = this.selectedBenefits || []
      this.selectedBenefits.push(benefit);
      if (this.getNameByValue(benefit) == 'Other') {
        this.showInput = true;
        this.customRequired(true, ['otherBenefit'])
      }
    } else {
      this.selectedBenefits = this.selectedBenefits?.filter((a: any) => a !== benefit);
      this.showInput = false;
      this.customRequired(false, ['otherBenefit']);

    }
  }

  goBack() {
    this.router.navigate(['/applications/' + (this.isView ? 'view/' : 'edit/') + this.id + '/step3']);
  }

  getNameByValue(value: string): string | undefined {
    const match = this.selectBenfits.find(item => item.value === value);
    return match ? match.name : undefined;
  }

  getBenefitsLookup() {
    const sub = this.lookupService
      .getSettingsLookup('Benefits')
      .subscribe({
        next: (res) => {
          this.selectBenfits = res.data;
          const index = this.selectBenfits.findIndex(x => x.name === "Other");
          if (index !== -1) {
            const [item] = this.selectBenfits.splice(index, 1);
            this.selectBenfits.push(item);
          }
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }
  newDialog(id: string = '') {
    
    const DialogRef = this.dialog.open(ExperienceComponent, {
      data: { applicationId: this.id, id: id },
      width: '90%',
      height: 'auto',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllEmploymentHistory();
      sub.unsubscribe();
    });
  }
  getAllEmploymentHistory() {
    const sub = this.employmentHistoryService
      .getAllEmploymentHistory({ application_id: this.id })
      .subscribe({
        next: (res) => {
          this.employmentHistory = res.data
          this.employmentHistoryIds = this.employmentHistory.map(x => String(x._id));
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }
  setBooleanValue(field: string, value: boolean) {
    this.step4.patchValue({ [field]: value });
  }
  submit() {
    if (this.step4.valid) {
      let data = this.step4.value;
      data.benefitIds = this.selectedBenefits;
      data.employmentHistoryIds = this.employmentHistoryIds || [];
      data.employersDismissalEndorsement = Number(data.employersDismissalEndorsement);
      if (this.id) {
        const sub = this.appilcationService.createOrUpdateSteps(data, 'Step4', this.id).subscribe({
          next: (res) => {
            this.router.navigate(['/applications/edit/' + this.id + '/step5']);
            sub.unsubscribe();
          },
          error: (res) => {
            sub.unsubscribe();
          },
        });
      }
    }
    else {
      this.step4.markAllAsTouched();
      this.scrollService.scrollToFirstInvalid()
    }
  }


  customRequired(required: boolean, arr: string[]) {
    const fields = arr;
    fields.forEach(field => {
      const control = this.step4.get(field);
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


  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
