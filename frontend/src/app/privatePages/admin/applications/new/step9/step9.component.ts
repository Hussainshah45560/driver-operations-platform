import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplateService } from '../../../../../_services/dataServices/template.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { ImportModule } from '../../../../../core/import/import.module';
import { SignComponent } from '../../../../../core/sign/sign.component';
import { DatePickerComponent } from '../../../../../core/date-picker/date-picker.component';
import { ApplicationsService } from '../../../../../_services/dataServices/applications.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { changeDateToApiFormat } from '../../../../../core/utility';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../../../../_services/common/auth.service';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { StatusCheckService } from '../../../../../_services/dataServices/statusCheck.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-step9',
  standalone: true,
  imports: [ImportModule, SignComponent, DatePickerComponent],
  templateUrl: './step9.component.html',
  styleUrl: './step9.component.scss',
})
export class Step9Component implements OnInit, OnDestroy {
  step9!: FormGroup;
  popiContent: any;
  stepStatus!: string;
  isView: boolean = false;;
  step8Changes: any;
  params: Params = {};
  sub: Subscription | undefined;
  id!: string;
  @ViewChild('signPadForDeclaration') child1: any;
  stepData: any;
  declarationSignUrl!: string;
  isDisabled: boolean = false;
  role!: string;
  approvalForm: FormGroup;
  rejected: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private applicationsService: ApplicationsService,
    private templateService: TemplateService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    public badgeColorService: BadgeColorService,
    public statusCheckService: StatusCheckService,
    private toasterService: ToastrService
  ) {

    this.approvalForm = this.formBuilder.group({
      reason: ['']
    })

    this.role = this.authService.userDetails?.role?.name ?? '';

    this.sub = this.route.parent?.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getStepData();
      }
    });
  }
  async ngOnInit() {
    this.popiContent = await this.getTemplateType('popi_template');
    const url = this.router.url;
    this.step9 = this.formBuilder.group({
      applicationSignDate: [new Date(), Validators.required],
    });
    if (url.includes('view')) {
      this.isView = true;
      this.step9.disable();
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
    const sub = this.applicationsService
      .approveStep(this.id, data, 'Step8', { step: 9 })
      .subscribe({
        next: (res) => {
          this.router.navigate(['/applications']);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }
  patchSign(event: any, type: string) {
    this.declarationSignUrl = event;
  }

  async getTemplateType(usedfor: string) {
    try {
      const res = await firstValueFrom(
        this.templateService.getTemplateType({ used_for: usedfor })
      );
      return this.sanitizer.bypassSecurityTrustHtml(res.data?.content || '');
    } catch (err) {
      console.error('Error fetching template:', err);
      return null;
    }
  }

  getStepData() {
    const sub = this.applicationsService.getStepData('9', this.id).subscribe({
      next: (res) => {
        this.stepData = res.data;
        if (!this.statusCheckService.isStepValid('editable', this.stepData?.stepStatus?.step9, this.stepData?.applicationStatus)
        ) {
          this.router.navigate(['/applications/view/' + this.id + '/step9']);
        }
        this.stepStatus = res.data.stepStatus.step9;
        if (this.stepStatus == 'completed' || this.stepStatus == 'approved') {
          this.step9.disable();
          this.isDisabled = true;
        }


        this.step9.patchValue({
          applicationSignDate: this.stepData.applicationSignDate,
        });
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }
  submit() {
    if (
      this.step9.valid &&
      this.declarationSignUrl != null
    ) {
      let data = Object.assign({}, this.step9.value);
      data.applicationSignDate = changeDateToApiFormat(
        data.applicationSignDate
      );
      data.applicationSign = this.declarationSignUrl;
      if (this.id) {
        const sub = this.applicationsService
          .createOrUpdateSteps(data, 'Step9', this.id)
          .subscribe({
            next: (res) => {
              if (this.role == 'Applicant') {
                this.toasterService.success('Application received. Approval pending.', 'Success');
              }
              this.router.navigate(['/applications']);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      }
    } else {
      this.step9.markAllAsTouched();
    }
  }
  goBack() {
    this.router.navigate(['/applications/' + (this.isView ? 'view/' : 'edit/') + this.id + '/step8']);
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
