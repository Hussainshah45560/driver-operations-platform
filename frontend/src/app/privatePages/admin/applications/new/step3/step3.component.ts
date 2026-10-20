import { Component, OnDestroy, OnInit } from '@angular/core';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { ImportModule } from '../../../../../core/import/import.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApplicationsService } from '../../../../../_services/dataServices/applications.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { changeDateToApiFormat } from '../../../../../core/utility';
import { AuthService } from '../../../../../_services/common/auth.service';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { StatusCheckService } from '../../../../../_services/dataServices/statusCheck.service';
import { ScrollService } from '../../../../../_services/common/scroll.service';

@Component({
  selector: 'app-step3',
  standalone: true,
  imports: [ImportModule, VMessageComponent,],
  templateUrl: './step3.component.html',
  styleUrl: './step3.component.scss'
})
export class Step3Component implements OnInit, OnDestroy {
  step3!: FormGroup;
  params: Params = {};
  sub: Subscription | undefined;
  id!: string;
  stepStatus!: string;
  isView: boolean = false;
  step3Changes: any;
  stepData: any;
  role!: string;
  approvalForm: FormGroup;
  rejected: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private appilcationService: ApplicationsService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    public badgeColorService: BadgeColorService,
    public statusCheckService: StatusCheckService,
    private scrollService: ScrollService
  ) {
    this.step3 = this.formBuilder.group({
      lastSchool: ['', Validators.required],
      tertiaryQualification: [false],
      highestGrade: ['', Validators.required],
      yearCompleted: ['', Validators.required],
      institutionName: [''],
      qualification: [''],
      tertiaryyearCompleted: [''],
      futureEducationPlans: [false],
      studyPlanDetail: [''],
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

  }


  ngOnInit(): void {
    const url = this.router.url;
    if (url.includes('view')) {
      this.isView = true;
      this.step3.disable();
    }
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }


  setBooleanValue(field: string, value: boolean) {
    this.step3.patchValue({ [field]: value });
  }
  goBack() {
    this.router.navigate(['/applications/' + (this.isView ? 'view/' : 'edit/') + this.id + '/step2']);
  }
  getStepData() {
    const sub = this.appilcationService
      .getStepData('3', this.id)
      .subscribe({
        next: (res) => {
          this.stepData = res.data;
          if (!this.statusCheckService.isStepValid('editable', this.stepData?.stepStatus?.step3, this.stepData?.applicationStatus)
          ) {
            this.router.navigate(['/applications/view/' + this.id + '/step3']);
          }
          if (this.stepData.stepStatus.step3 == 'changed') {
            this.step3.disable();
          }
          if (this.stepData && this.stepData?.step3Changes) {
            this.step3Changes = this.stepData?.step3Changes;
          }
          this.step3.patchValue({
            lastSchool: this.stepData?.education?.educationDetails?.lastSchool ?? '',
            highestGrade: this.stepData?.education?.educationDetails?.highestGrade ?? '',
            yearCompleted: this.stepData?.education?.educationDetails?.yearCompleted ?? '',
            tertiaryQualification: this.stepData?.education?.tertiaryQualification ?? false,
            institutionName: this.stepData?.education?.tertiaryEducation?.institutionName ?? '',
            qualification: this.stepData?.education?.tertiaryEducation?.qualification ?? '',
            tertiaryyearCompleted: this.stepData?.education?.tertiaryEducation?.yearCompleted ?? '',
            futureEducationPlans: this.stepData?.education?.futureEducationPlans ?? false,
            studyPlanDetail: this.stepData?.education?.studyPlanDetail ?? ''
          });
          this.customRequired(this.stepData?.education?.futureEducationPlans, ['studyPlanDetail'])
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  submit() {
    if (this.step3.valid) {
      let data = Object.assign({}, this.step3.value);
      if (data.tertiaryQualification) {
        data.tertiaryEducation = {
          "institutionName": data?.institutionName,
          "qualification": data?.qualification,
          "yearCompleted": changeDateToApiFormat(data?.tertiaryyearCompleted)
        }
      }
      data.educationDetails = {
        "lastSchool": data?.lastSchool,
        "highestGrade": data?.highestGrade,
        "yearCompleted": changeDateToApiFormat(data?.yearCompleted)
      }
      const keysToRemove = [
        'institutionName',
        'qualification',
        'highestGrade',
        'lastSchool',
        'yearCompleted',
        'tertiaryyearCompleted'
      ];
      keysToRemove.forEach(key => delete data[key]);

      if (this.id) {
        const sub = this.appilcationService.createOrUpdateSteps(data, 'Step3', this.id).subscribe({
          next: (res) => {
            this.router.navigate(['/applications/edit/' + this.id + '/step4']);
            sub.unsubscribe();
          },
          error: (res) => {
            sub.unsubscribe();
          },
        });
      }
    }
    else {
      this.step3.markAllAsTouched();
      this.scrollService.scrollToFirstInvalid()
    }
  }


  approveStep(status: string) {
    const data = Object.assign({});
    if (this.approvalForm.value.reason != '') {
      data.reason = this.approvalForm.value.reason
    };
    data.status = status;
    const sub = this.appilcationService
      .approveStep(this.id, data, 'Step3')
      .subscribe({
        next: (res) => {
          this.router.navigate(['/applications/view/' + this.id + '/step4']);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  customRequired(required: boolean, arr: string[]) {
    const fields = arr;
    fields.forEach(field => {
      const control = this.step3.get(field);
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
