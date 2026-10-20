import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContractsService } from '../../../../_services/dataServices/contracts.service';
import { AuthService } from '../../../../_services/common/auth.service';
import { changeDateToApiFormat } from '../../../../core/utility';
import { ImportModule } from '../../../../core/import/import.module';
import { SignComponent } from '../../../../core/sign/sign.component';
import { DatePickerComponent } from '../../../../core/date-picker/date-picker.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sign-contract',
  standalone: true,
  imports: [ImportModule, SignComponent, DatePickerComponent],
  templateUrl: './sign-contract.component.html',
  styleUrl: './sign-contract.component.scss'
})
export class SignContractComponent implements OnInit, OnDestroy {
  params: Params = {};
  form!: FormGroup;
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
    private contractsService: ContractsService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toasterService: ToastrService
  ) {



    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getTemplateToSign();
      }
    });
    this.role = this.authService.userDetails?.role?.name ?? '';
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      adminSign: [''],
      adminSignDate: [''],
      userSign: [''],
      userSignDate: [new Date()]
    });
  }
  getSignatureCount(sig: any) {
    return Object.keys(sig || {}).length;
  }

  getTemplateToSign() {
    const sub = this.contractsService.getTemplateToSign(this.id).subscribe({
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

  downloadFile() {
    const sub = this.contractsService.downloadContract(this.data?._id, true).subscribe({
      next: (res: any) => {
        window.open(res.data.url, '_blank');
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }


  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      data.userSign = this.userSignUrl;
      data.userSignDate = changeDateToApiFormat(data?.userSignDate);
      delete data.adminSign;
      delete data.adminSignDate;
      if (this.id != '' && this.id != undefined) {
        const sub = this.contractsService
          .saveSignedTemplate(data, this.id)
          .subscribe({
            next: (res) => {
              this.toasterService.success('Please Login Again to get full access to the platform', 'Success');
              this.router.navigate(['/home']);

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
    this.routSub.unsubscribe();
  }

}