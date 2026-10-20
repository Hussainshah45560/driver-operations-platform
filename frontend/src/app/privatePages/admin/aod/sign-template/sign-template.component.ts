import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ImportModule } from '../../../../core/import/import.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SignComponent } from '../../../../core/sign/sign.component';
import { DatePickerComponent } from '../../../../core/date-picker/date-picker.component';
import { AodsService } from '../../../../_services/dataServices/aods.service';
import { AuthService } from '../../../../_services/common/auth.service';
import { changeDateToApiFormat } from '../../../../core/utility';

@Component({
  selector: 'app-sign-template',
  standalone: true,
  imports: [ImportModule, SignComponent, DatePickerComponent],
  templateUrl: './sign-template.component.html',
  styleUrl: './sign-template.component.scss'
})
export class SignTemplateComponent implements OnInit, OnDestroy {
  params: Params = {};
  form: FormGroup;
  routSub: Subscription;
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
  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private aodService: AodsService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
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
    const sub = this.aodService.getTemplateToSign(this.id).subscribe({
      next: (res) => {
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
      if ((this.data.signature?.adminSign != null && !['Driver'].includes(this.role)) || (this.data.signature?.userSign != null && ['Driver'].includes(this.role))) {
        this.router.navigate(['/aod']);
      } else {
        const data = Object.assign({}, this.form.value);
        if (['Driver'].includes(this.role)) {
          data.userSign = this.userSignUrl;
          data.userSignDate = changeDateToApiFormat(data?.userSignDate);
          delete data.adminSign;
          delete data.adminSignDate
        } else {
          data.adminSign = this.adminSignUrl;
          data.adminSignDate = changeDateToApiFormat(data?.adminSignDate);
          delete data.userSign;
          delete data.userSignDate
        }
        if (this.id != '' && this.id != undefined) {
          const sub = this.aodService
            .saveSignedTemplate(data, this.id)
            .subscribe({
              next: (res) => {
                this.router.navigate(['/aod']);
                sub.unsubscribe();
              },
              error: (res) => {
                sub.unsubscribe();
              },
            });
        }
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.routSub.unsubscribe();
  }

}
