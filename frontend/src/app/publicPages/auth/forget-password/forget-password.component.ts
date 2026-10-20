import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PublicPageService } from '../../../_services/dataServices/publicPage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../_services/common/auth.service';
import { VMessageComponent } from '../../../core/v-message/v-message.component';
import { ImportModule } from '../../../core/import/import.module';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [VMessageComponent, ImportModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent implements OnInit {
  form: FormGroup;
  isAdmin: boolean = false;
  description: any;
  heading: any;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private publicPageService: PublicPageService,
    private sanitizer: DomSanitizer
  ) {
    this.form = this.formBuilder.group({
      phoneNumber: ['', [Validators.pattern(/^\+?[0-9]\d{9,14}$/)]],
      email: ['', [Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]]
    });
    this.getRegistrationPage();
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.isAdmin = params['isAdmin'];
    });
  }
  goTo(page: string) {
    this.router.navigate([`/${page}`], { queryParams: { isAdmin: this.isAdmin, } })
  }

  getRegistrationPage() {
    const sub = this.publicPageService.getPublicPageByCode({ code: 'forgot-password-page' }).subscribe({
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
      const sub = this.authService.forgotPassword(this.form.value.phoneNumber, this.form.value.email).subscribe({
        next: (res) => {
          this.router.navigate(['confirm-otp'], { state: { phoneNumber: this.form.value.phoneNumber, email: this.form.value.email, isAdmin: this.isAdmin } })
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
