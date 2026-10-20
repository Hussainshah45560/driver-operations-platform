import { Component, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VMessageComponent } from '../../../core/v-message/v-message.component';
import { AuthService } from '../../../_services/common/auth.service';
import { Router } from '@angular/router';
import { PublicPageService } from '../../../_services/dataServices/publicPage.service';
import { MustMatch } from '../../../core/must-match.validator';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ImportModule, VMessageComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent implements OnInit {
  form: FormGroup;
  showPassword: boolean = false;
  confirmPasswordShow: boolean = false;
  description: any;
  heading: any;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private publicPageService: PublicPageService,
      private sanitizer: DomSanitizer
  ) {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      passwordConfirm: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)(?!.*\s).+$/), Validators.maxLength(24), Validators.minLength(8)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)(?!.*\s).+$/), Validators.maxLength(24), Validators.minLength(8)]],
      phoneNumber: [null, [Validators.required, Validators.pattern(/^\+?[0-9]\d{9,14}$/)]],
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
    const sub = this.publicPageService.getPublicPageByCode({ code: 'registration-page' }).subscribe({
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
      const data = this.form.value;
      const sub = this.authService.registerUser(data).subscribe({
        next: (res) => {
          this.router.navigate(['login'])
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
