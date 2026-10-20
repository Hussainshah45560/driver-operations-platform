import { Component, OnDestroy, OnInit } from '@angular/core';
import { NoticesService } from '../../../../_services/dataServices/notices.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { changeDateToApiFormat } from '../../../../core/utility';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../_services/common/auth.service';
import { ImportModule } from '../../../../core/import/import.module';
import { SignComponent } from '../../../../core/sign/sign.component';
import { DatePickerComponent } from '../../../../core/date-picker/date-picker.component';
@Component({
  selector: 'app-sign-notice',
  standalone: true,
  imports: [ImportModule, SignComponent, DatePickerComponent],
  templateUrl: './sign-notice.component.html',
  styleUrl: './sign-notice.component.scss'
})
export class SignNoticeComponent implements OnInit, OnDestroy {
  params: Params = {};
  form: FormGroup;
  routSub: Subscription;
  qSub: Subscription;
  id!: string;
  role!: string;
  templateName!: string;
  templateData: any;
  showTemplate: boolean = false;
  isEdit: boolean = false;
  userSignUrl!: string;
  adminSignUrl!: string;
  data: any;
  hasAdminSigned: boolean = false;
  hasUserSigned: boolean = false;
  warningNumber!: string;
  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private noticesService: NoticesService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
    });

    this.qSub = this.route.queryParams.subscribe((params) => {
      this.warningNumber = params['warningNumber'];
      if (this.id != null && this.warningNumber != null) {
        this.getTemplateToSign();
      }
    });


    this.role = this.authService.userDetails?.role?.name ?? '';

    this.form = this.formBuilder.group({
      adminSign: [''],
      adminSignDate: [''],
      userSign: [''],
      userSignDate: ['']
    });
  }

  ngOnInit(): void {

  }
  getSignatureCount(sig: any) {
    return Object.keys(sig || {}).length;
  }

  getTemplateToSign() {
    const sub = this.noticesService.downloadContract({ warning_number: this.warningNumber, disciplinary_id: this.id }).subscribe({
      next: (res: any) => {
        this.data = res.data;
        this.templateData = this.sanitizer.bypassSecurityTrustHtml(this.data?.template || '');
        this.templateName = this.data?.templateName;
        this.hasAdminSigned =
          !!this.data?.signature?.adminSign &&
          !!this.data?.signature?.adminSignDate;
        this.hasUserSigned =
          !!this.data?.signature?.userSign &&
          !!this.data?.signature?.userSignDate;
        if (Object.keys(this.data?.signature).length > 0) {
          this.showTemplateContent('view');
          this.form.patchValue({
            adminSign: this.data?.signature?.adminSign ?? '',
            adminSignDate: this.data?.signature?.adminSignDate ?? '',
            userSign: this.data?.signature?.userSign ?? '',
            userSignDate: this.data?.signature?.userSignDate ?? '',
          })
        }
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  showTemplateContent(bit: string) {
    this.showTemplate = true;
    if (bit == 'view') {
      this.isEdit = false;
    } else {
      this.isEdit = true;
    }

  }

  patchSign(event: any, type: string) {
    if (type == 'admin') {
      this.adminSignUrl = event;
      this.form.patchValue({
        adminSign: event
      });
    } else {
      this.userSignUrl = event;
      this.form.patchValue({
        userSign: event
      });
    }
  }


  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      data.userSign = this.userSignUrl;
      data.userSignDate = changeDateToApiFormat(data?.userSignDate);
      delete data.adminSign;
      delete data.adminSignDate;
      if (this.id != '' && this.id != undefined) {
        const sub = this.noticesService
          .saveSignedTemplate(data, this.id)
          .subscribe({
            next: (res) => {
              this.router.navigate(['/notices']);

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

  ngOnDestroy(): void {
    this.qSub.unsubscribe();
    this.routSub.unsubscribe();
  }

}
