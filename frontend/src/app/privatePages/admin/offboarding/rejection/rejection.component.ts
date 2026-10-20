import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OffboardingService } from '../../../../_services/dataServices/offboarding.service';
import { ImportModule } from '../../../../core/import/import.module';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';

@Component({
  selector: 'app-rejection',
  standalone: true,
  imports: [ImportModule, VMessageComponent],
  templateUrl: './rejection.component.html',
  styleUrl: './rejection.component.scss',
})
export class RejectionComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<RejectionComponent>,
    private offboardingService: OffboardingService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      // this.getSingleAccessory();
    }
    this.form = this.formBuilder.group({
      reason: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}
  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      if (this._id != '' && this._id != undefined) {
        const sub = this.offboardingService
          .reasonForRejection(data, this._id)
          .subscribe({
            next: (res) => {
              this.close();
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {
        const sub = this.offboardingService.reasonForRejection(data).subscribe({
          next: (res) => {
            this.close();
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

  close() {
    this.dialogRef.close();
  }
}
