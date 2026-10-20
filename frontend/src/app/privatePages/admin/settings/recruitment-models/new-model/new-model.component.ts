import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RecruitmentModelsService } from '../../../../../_services/dataServices/recruitmentModels.service';

@Component({
  selector: 'app-new-model',
  standalone: true,
  imports: [ImportModule, VMessageComponent],
  templateUrl: './new-model.component.html',
  styleUrl: './new-model.component.scss'
})
export class NewModelComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  itemList: any;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewModelComponent>,
    private recruitmentModelsService: RecruitmentModelsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      this.getSingleRecruitmentModels();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]]
    });

  }

  ngOnInit(): void {
  }

  getSingleRecruitmentModels() {
    const sub = this.recruitmentModelsService.getSingleRecruitmentModels(this._id).subscribe({
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
        const sub = this.recruitmentModelsService
          .createOrUpdateRecruitmentModels(data, this._id)
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
        const sub = this.recruitmentModelsService.createOrUpdateRecruitmentModels(data).subscribe({
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