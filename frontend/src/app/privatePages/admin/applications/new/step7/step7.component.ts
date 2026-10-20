import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { DatePickerComponent } from '../../../../../core/date-picker/date-picker.component';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { ImportModule } from '../../../../../core/import/import.module';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApplicationsService } from '../../../../../_services/dataServices/applications.service';
import { AuthService } from '../../../../../_services/common/auth.service';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { StatusCheckService } from '../../../../../_services/dataServices/statusCheck.service';

@Component({
  selector: 'app-step7',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent, DatePickerComponent],
  templateUrl: './step7.component.html',
  styleUrl: './step7.component.scss'
})
export class Step7Component implements OnInit, OnDestroy {
  step7!: FormGroup;
  stepStatus!: string;
  isView: boolean = false;
  step7Changes: any;
  params: Params = {};
  sub: Subscription | undefined;
  id!: string;
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
    public statusCheckService: StatusCheckService
  ) {
    this.step7 = this.formBuilder.group({
      isArrested: [false],
      arrestDetails: [''],
      courtCase: [false],
      caseDetails: [''],
      criminalRecordDetails: ['', Validators.required],
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
      this.step7.disable();
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
      .approveStep(this.id, data, 'Step7')
      .subscribe({
        next: (res) => {
          this.router.navigate(['/applications/view/' + this.id + '/step8']);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }
  getStepData() {
    const sub = this.appilcationService
      .getStepData('7', this.id)
      .subscribe({
        next: (res) => {
          this.stepData = res.data;
          if (!this.statusCheckService.isStepValid('editable', this.stepData?.stepStatus?.step7, this.stepData?.applicationStatus)
        ) {
          this.router.navigate(['/applications/view/' + this.id + '/step7']);
        }
          if (this.stepData.stepStatus.step7 == 'changed') {
            this.step7.disable();
          }
          if (this.stepData && this.stepData?.step7Changes) {
            this.step7Changes = this.stepData?.step7Changes;
          }
          this.step7.patchValue({
            isArrested: this.stepData?.security?.isArrested ?? false,
            arrestDetails: this.stepData?.security?.arrestDetails ?? '',
            courtCase: this.stepData?.security?.courtCase ?? false,
            caseDetails: this.stepData?.security?.caseDetails ?? '',
            criminalRecordDetails: this.stepData?.security?.criminalRecordDetails ?? '',
          })
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  setBooleanValue(field: string, value?: string | boolean) {
    this.step7.patchValue({ [field]: value });
  }

  goBack() {
    const prevStep = this.stepData?.applicationType === 'other' ? 'step5' : 'step6';
    this.router.navigate(['/applications/' + (this.isView ? 'view/' : 'edit/') + this.id + '/' + prevStep]);
  }

  submit() {
    if (this.step7.valid) {
      let data = this.step7.value;
      if (this.id) {
        const sub = this.appilcationService.createOrUpdateSteps(data, 'Step7', this.id).subscribe({
          next: (res) => {
            this.router.navigate(['/applications/edit/' + this.id + '/step8']);
            sub.unsubscribe();
          },
          error: (res) => {
            sub.unsubscribe();
          },
        });
      }
    }
    else {
      this.step7.markAllAsTouched();
    }
  }

  customRequired(required: boolean, arr: string[]) {
    const fields = arr;
    fields.forEach(field => {
      const control = this.step7.get(field);
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
