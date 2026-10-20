import { Component, Inject, OnInit, Optional } from '@angular/core';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChecklistTypesService } from '../../../../../_services/dataServices/checklistTypes.service';

@Component({
  selector: 'app-new-checklist-type',
  standalone: true,
  imports: [ImportModule, VMessageComponent],
  templateUrl: './new-checklist-type.component.html',
  styleUrl: './new-checklist-type.component.scss',
})
export class NewChecklistTypeComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  itemList: any;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewChecklistTypeComponent>,
    private checklistTypesService: ChecklistTypesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      this.getSingleChecklistType();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  getSingleChecklistType() {
    const sub = this.checklistTypesService
      .getSingleChecklistType(this._id)
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
        const sub = this.checklistTypesService
          .createOrUpdateChecklistType(data, this._id)
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
        const sub = this.checklistTypesService
          .createOrUpdateChecklistType(data)
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
