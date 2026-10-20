import { Component, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VMessageComponent } from '../../../core/v-message/v-message.component';
import { AuthService } from '../../../_services/common/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ImportModule, VMessageComponent, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  showPassword: boolean = false;
  returnUrl!: string;
  isAdmin: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private _authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.formBuilder.group({
      password: [
        null,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(16),
        ],
      ],
      email: ['', [Validators.required, Validators.pattern(/^\+?[0-9]\d{9,14}$|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]]
    });
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.isAdmin = params['isAdmin'];
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'].replace(/->/g, '/');
        console.log('Return URL:', this.returnUrl);
      }
    });
  }
  goTo(page: string) {
    this.router.navigate([`/${page}`], { queryParams: { isAdmin: this.isAdmin, } });
  }
  submit() {
    if (this.form.valid) {
      const sub = this._authService
        .login(this.form.value.email, this.form.value.phoneNumber, this.form.value.password)
        .subscribe({
          next: (res) => {
            if (this.returnUrl) {
              this.router.navigateByUrl(this.returnUrl);
              this.form.reset();
            } else {
              const navigationData = res?.data?.navigation ?? [];
              localStorage.setItem(
                'navigation',
                JSON.stringify(navigationData)
              );
              if (this._authService?.userDetails?.role?.name && ["Driver", "Other","Applicant"].indexOf(this._authService?.userDetails?.role?.name) > -1) {
                this.router.navigateByUrl('/home');
              } else {
                this.router.navigateByUrl('/dashboard');
              }
              this.form.reset();
            }
            sub.unsubscribe();
          },
          error: (res) => {
            sub.unsubscribe();
          },
        });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
