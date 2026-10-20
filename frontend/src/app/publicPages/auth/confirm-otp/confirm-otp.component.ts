import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PublicPageService } from '../../../_services/dataServices/publicPage.service';
import { AuthService } from '../../../_services/common/auth.service';
import { Page } from '../../../core/modals';
import { ImportModule } from '../../../core/import/import.module';
import { Router } from '@angular/router';
import { VMessageComponent } from '../../../core/v-message/v-message.component';
import { NgOtpInputComponent } from 'ng-otp-input';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-confirm-otp',
  standalone: true,
  imports: [ImportModule, VMessageComponent, NgOtpInputComponent],
  templateUrl: './confirm-otp.component.html',
  styleUrl: './confirm-otp.component.scss'
})
export class ConfirmOtpComponent implements OnInit {
  form: FormGroup;
   description: any;
  heading: any;
  dataSource!: Page;
  phoneNumber: string = '';
  email: string = '';
  isAdmin: boolean = false;
  otpConfig = {
    length: 5,
    allowNumbersOnly: true,
    inputStyles: {
      width: '100%',
      maxWidth: '54px',
      height: '54px',
      'font-size': '16px',
      'text-align': 'center',
      border: '1px solid #73777F',
      'border-radius': '4px',
      margin: '0 12px',
    },
  };
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private publicPageService: PublicPageService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
  ) {
    this.form = this.formBuilder.group({
      code: [null, [Validators.required]],
    });
    this.getRegistrationPage();
    const nav = this.router.getCurrentNavigation();
    this.phoneNumber = nav?.extras?.state?.['phoneNumber'];
    this.email = nav?.extras?.state?.['email'];
    this.isAdmin = nav?.extras?.state?.['isAdmin'];
  }
  ngOnInit(): void {
  }
  goTo(page: string) {
    this.router.navigate([`/${page}`], { queryParams: { isAdmin: this.isAdmin} })
  }

  getRegistrationPage() {
    const sub = this.publicPageService.getPublicPageByCode({ code: 'confirmation-page' }).subscribe({
      next: (res) => {
        this.heading = this.sanitizer.bypassSecurityTrustHtml(res.data?.heading);
        this.description = this.sanitizer.bypassSecurityTrustHtml(res.data?.description);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }
  submit() {
    if (this.form.valid) {
      const sub = this.authService.verifyCode(this.phoneNumber, this.email, Number(this.form.value.code)).subscribe({
        next: (res) => {
          if (res?.data.success) {
            this.router.navigate(['new-password'], { state: { phoneNumber: this.phoneNumber, email: this.email, code: Number(this.form.value.code), isAdmin: this.isAdmin } })
          } else {
            this.toastr.error('Your code is invalid', 'OTP Error');
          }

          sub.unsubscribe();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
    }
    else {
      this.form.markAllAsTouched();
    }
  }
}
