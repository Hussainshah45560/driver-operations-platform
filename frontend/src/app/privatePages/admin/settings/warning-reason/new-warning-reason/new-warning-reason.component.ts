import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { WarningReasonsService } from '../../../../../_services/dataServices/warningReasons.service';

@Component({
  selector: 'app-new-warning-reason',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent],
  templateUrl: './new-warning-reason.component.html',
  styleUrl: './new-warning-reason.component.scss',
})
export class NewWarningReasonComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewWarningReasonComponent>,
    private warningReasonsService: WarningReasonsService,

    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      this.getSingleWarningReason();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  getSingleWarningReason() {
    const sub = this.warningReasonsService
      .getSingleWarningReason(this._id)
      .subscribe({
        next: (res) => {
          let data = res.data;
          this.form.patchValue({
            name: data?.name ?? '',
          });
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      if (this._id != '' && this._id != undefined) {
        const sub = this.warningReasonsService
          .createOrUpdatWarningReason(data, this._id)
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
        const sub = this.warningReasonsService
          .createOrUpdatWarningReason(data)
          .subscribe({
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
