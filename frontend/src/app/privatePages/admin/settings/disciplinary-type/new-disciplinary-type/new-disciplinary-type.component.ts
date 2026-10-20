import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { lookupData } from '../../../../../core/modals';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { DisciplinaryTypesService } from '../../../../../_services/dataServices/disciplinaryTypes.service';

@Component({
  selector: 'app-new-disciplinary-type',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent],
  templateUrl: './new-disciplinary-type.component.html',
  styleUrl: './new-disciplinary-type.component.scss',
})
export class NewDisciplinaryTypeComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  selecType: lookupData[] = [];
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewDisciplinaryTypeComponent>,
    private disciplinaryTypeService: DisciplinaryTypesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      this.getSingleDisciplinaryType();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.selecType = [
      { name: 'Employee', value: 'employee' },
      { name: 'Contractor', value: 'contractor' },
    ];
  }

  getSingleDisciplinaryType() {
    const sub = this.disciplinaryTypeService
      .getSingleDisciplinaryType(this._id)
      .subscribe({
        next: (res) => {
          let data = res.data;
          this.form.patchValue({
            name: data?.name ?? '',
            type: data.type ?? '',
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
        const sub = this.disciplinaryTypeService
          .createOrUpdateDisciplinaryType(data, this._id)
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
        const sub = this.disciplinaryTypeService
          .createOrUpdateDisciplinaryType(data)
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
