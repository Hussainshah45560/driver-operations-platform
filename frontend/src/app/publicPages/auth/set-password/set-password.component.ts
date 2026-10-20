import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from '../../../core/must-match.validator';
import { PublicPageService } from '../../../_services/dataServices/publicPage.service';
import { AuthService } from '../../../_services/common/auth.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ImportModule } from '../../../core/import/import.module';
import { VMessageComponent } from '../../../core/v-message/v-message.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [VMessageComponent, ImportModule],
  templateUrl: './set-password.component.html',
  styleUrl: './set-password.component.scss'
})
export class SetPasswordComponent implements OnInit, OnDestroy {
  form: FormGroup;
  description: any;
  heading: any;
  showPassword: boolean = false;
  confirmPasswordShow: boolean = false;
  phoneNumber: string = '';
  code: string = '';
  email: string = '';
  isAdmin: boolean = false;
  queryParams: Params = {};
  qSub: Subscription;
  validateData: any;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private publicPageService: PublicPageService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      
      if (this.queryParams['code'] != null) {
        this.code = this.queryParams['code'] ?? '';
        this.validateUrl();
      }
      else {
        this.router.navigate(['/'])
      }
    });

    this.form = this.formBuilder.group({
      passwordConfirm: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)(?!.*\s).+$/), Validators.maxLength(24), Validators.minLength(8)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)(?!.*\s).+$/), Validators.maxLength(24), Validators.minLength(8)]],
    }, {
      validator: MustMatch('password', 'passwordConfirm')
    });


    this.getRegistrationPage();
  }
  ngOnInit(): void {
  }
  goTo(page: string) {
    this.router.navigate([`/${page}`])
  }

  getRegistrationPage() {
    const sub = this.publicPageService.getPublicPageByCode({ code: 'set-password-page' }).subscribe({
      next: (res) => {
        this.heading = this.sanitizer.bypassSecurityTrustHtml(res.data?.heading);
        this.description = this.sanitizer.bypassSecurityTrustHtml(res.data?.description);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }
  validateUrl() {
    const sub = this.authService.validateUrl(this.queryParams).subscribe({
      next: (res) => {
        this.validateData = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  resendEmail() {
    const sub = this.authService.resendEmail(this.queryParams).subscribe({
      next: (res) => {

      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  submit() {
    if (this.form.valid && this.phoneNumber != null && this.code != null) {
      const sub = this.authService.createNewPassword(this.code, this.form.value.password, this.form.value.passwordConfirm).subscribe({
        next: (res) => {
          this.router.navigate(['success']);
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
  ngOnDestroy(): void {
    this.qSub.unsubscribe();
  }
}
