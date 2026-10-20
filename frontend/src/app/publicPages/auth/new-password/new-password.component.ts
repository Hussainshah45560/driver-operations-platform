import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VMessageComponent } from '../../../core/v-message/v-message.component';
import { ImportModule } from '../../../core/import/import.module';
import { PublicPageService } from '../../../_services/dataServices/publicPage.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../_services/common/auth.service';
import { MustMatch } from '../../../core/must-match.validator';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [VMessageComponent, ImportModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss'
})
export class NewPasswordComponent implements OnInit {
  form: FormGroup;
  description: any;
  heading: any;
  showPassword: boolean = false;
  confirmPasswordShow: boolean = false;
  phoneNumber: string = '';
  code: string = '';
  email: string = '';
  isAdmin: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private publicPageService: PublicPageService,
    private sanitizer: DomSanitizer
  ) {
    this.form = this.formBuilder.group({
      passwordConfirm: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)(?!.*\s).+$/), Validators.maxLength(24), Validators.minLength(8)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)(?!.*\s).+$/), Validators.maxLength(24), Validators.minLength(8)]],
    }, {
      validator: MustMatch('password', 'passwordConfirm')
    });
    const nav = this.router.getCurrentNavigation();
    this.phoneNumber = nav?.extras?.state?.['phoneNumber'];
    this.code = nav?.extras?.state?.['code'];
    this.email = nav?.extras?.state?.['email'];
    this.isAdmin = nav?.extras?.state?.['isAdmin'];

    this.getRegistrationPage();
  }
  ngOnInit(): void {
  }
  goTo(page: string) {
    this.router.navigate([`/${page}`])
  }

  getRegistrationPage() {
    const sub = this.publicPageService.getPublicPageByCode({ code: 'new-password-page' }).subscribe({
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
    if (this.form.valid && this.phoneNumber != null && this.code != null) {
      const sub = this.authService.setNewPassword(this.phoneNumber, this.email, Number(this.code), this.form.value.password, this.form.value.passwordConfirm).subscribe({
        next: (res) => {
          this.router.navigate(['success'], { state: { isAdmin: this.isAdmin } })
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
