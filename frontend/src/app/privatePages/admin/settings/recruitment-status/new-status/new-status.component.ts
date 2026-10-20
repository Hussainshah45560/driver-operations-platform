import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RecruitmentStatusesService } from '../../../../../_services/dataServices/recruitmentStatus.service';

@Component({
  selector: 'app-new-status',
  standalone: true,
  imports: [ImportModule, VMessageComponent],
  templateUrl: './new-status.component.html',
  styleUrl: './new-status.component.scss'
})
export class NewStatusComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  itemList: any;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewStatusComponent>,
    private recruitmentStatusesService: RecruitmentStatusesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      this.getSingleRecruitmentStatuses();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]]
    });

  }

  ngOnInit(): void {
  }

  getSingleRecruitmentStatuses() {
    const sub = this.recruitmentStatusesService.getSingleRecruitmentStatuses(this._id).subscribe({
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
        const sub = this.recruitmentStatusesService
          .createOrUpdateRecruitmentStatuses(data, this._id)
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
        const sub = this.recruitmentStatusesService.createOrUpdateRecruitmentStatuses(data).subscribe({
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