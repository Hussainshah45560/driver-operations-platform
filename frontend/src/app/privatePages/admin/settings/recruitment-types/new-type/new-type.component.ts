import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RecruitmentTypesService } from '../../../../../_services/dataServices/recruitmentTypes.service';

@Component({
  selector: 'app-new-type',
  standalone: true,
  imports: [ImportModule, VMessageComponent],
  templateUrl: './new-type.component.html',
  styleUrl: './new-type.component.scss'
})
export class NewTypeComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  itemList: any;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewTypeComponent>,
    private recruitmentTypesService: RecruitmentTypesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      this.getSingleRecruitmentTypes();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]]
    });

  }

  ngOnInit(): void {
  }

  getSingleRecruitmentTypes() {
    const sub = this.recruitmentTypesService.getSingleRecruitmentTypes(this._id).subscribe({
      next: (res) => {
        let data = res.data;
        this.form.patchValue({
          name: data?.name ?? ''
        })
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
        const sub = this.recruitmentTypesService
          .createOrUpdateRecruitmentTypes(data, this._id)
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
        const sub = this.recruitmentTypesService.createOrUpdateRecruitmentTypes(data).subscribe({
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