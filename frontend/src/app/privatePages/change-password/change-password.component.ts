import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { VMessageComponent } from '../../core/v-message/v-message.component';
import { ImportModule } from '../../core/import/import.module';
import { UsersService } from '../../_services/dataServices/users.service';
import { MustMatch } from '../../core/must-match.validator';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ImportModule, VMessageComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {
  form: FormGroup;
  showOldPassword: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  // userId!: string;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<ChangePasswordComponent>,
    private userService: UsersService
  ) {
    this.form = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validator: MustMatch('newPassword', 'confirmPassword')
    });

  }

  ngOnInit(): void {
  }



  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      const sub = this.userService.updatePassword(data).subscribe({
        next: (res) => {
          this.close();
          sub.unsubscribe();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });

    }
  }

  close() {
    this.dialogRef.close();
  }

}