import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { DisputeTypesService } from '../../../../../_services/dataServices/disputeTypes.service';

@Component({
  selector: 'app-new-dispute-type',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent],
  templateUrl: './new-dispute-type.component.html',
  styleUrl: './new-dispute-type.component.scss',
})
export class NewDisputeTypeComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewDisputeTypeComponent>,
    private disputeTypesService: DisputeTypesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      this.getSingleDisputeType();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  getSingleDisputeType() {
    const sub = this.disputeTypesService
      .getSingleDisputeType(this._id)
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
        const sub = this.disputeTypesService
          .createOrUpdateDisputeType(data, this._id)
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
        const sub = this.disputeTypesService
          .createOrUpdateDisputeType(data)
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
