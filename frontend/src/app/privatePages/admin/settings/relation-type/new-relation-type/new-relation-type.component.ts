import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lookupData } from '../../../../../core/modals';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RelationTypesService } from '../../../../../_services/dataServices/relationTypes.service';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';

@Component({
  selector: 'app-new-relation-type',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent],
  templateUrl: './new-relation-type.component.html',
  styleUrl: './new-relation-type.component.scss',
})
export class NewRelationTypeComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  itemList: any;
  selectType: lookupData[] = [];
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewRelationTypeComponent>,
    private relationTypesService: RelationTypesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      this.getSingleRelationType();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      category: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.selectType = [
      { name: 'Kin', value: 'Kin' },
      { name: 'Spouse', value: 'Spouse' },
    ];
  }

  getSingleRelationType() {
    const sub = this.relationTypesService
      .getSingleRelationType(this._id)
      .subscribe({
        next: (res) => {
          let data = res.data;
          this.form.patchValue({
            name: data?.name ?? '',
            category: data?.category ?? '',
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
        const sub = this.relationTypesService
          .createOrUpdateRelationType(data, this._id)
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
        const sub = this.relationTypesService
          .createOrUpdateRelationType(data)
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
