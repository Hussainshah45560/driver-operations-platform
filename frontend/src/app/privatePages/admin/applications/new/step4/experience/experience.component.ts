import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../../core/import/import.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VMessageComponent } from '../../../../../../core/v-message/v-message.component';
import { DatePickerComponent } from '../../../../../../core/date-picker/date-picker.component';
import { changeDateToApiFormat } from '../../../../../../core/utility';
import { EmploymentHistoryService } from '../../../../../../_services/dataServices/employmentHistory.service';
import { LbAutoCompleteComponent } from '../../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { lookupData } from '../../../../../../core/modals';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [ImportModule, VMessageComponent, DatePickerComponent, LbAutoCompleteComponent],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss'
})
export class ExperienceComponent implements OnInit {
  form: FormGroup;
  id: string = '';
  applicationId: string = '';
  itemList: any;
  selectType: lookupData[] = [{ name: 'Monthly', value: 'monthly' }, { name: 'Weekly', value: 'weekly' },]
  constructor(
    private formBuilder: FormBuilder,
    private employmentHistoryService: EmploymentHistoryService,
    @Optional() private dialogRef: MatDialogRef<ExperienceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.form = this.formBuilder.group({
      companyName: ['', [Validators.required]],
      position: ['', [Validators.required]],
      salary: ['', [Validators.required]],
      reasonForLeaving: ['', [Validators.required]],
      jobDescription: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      referenceName: [''],
      type: [''],
      referenceDesignation: [''],
      referenceContact: ['', Validators.pattern(/^\+?[0-9]\d{9,14}$/)]
    });
    this.applicationId = this.data.applicationId;
    if (this.data.id) {
      this.id = this.data.id;
      this.getSingleEmployment();
    }
  }
  ngOnInit(): void {

  }

  getSingleEmployment() {
    const sub = this.employmentHistoryService.getSingleEmployment(this.id).subscribe({
      next: (res) => {
        let data = res.data;
        this.form.patchValue({
          companyName: data?.companyName ?? '',
          position: data?.position ?? '',
          salary: data?.salary ?? '',
          reasonForLeaving: data?.reasonForLeaving ?? '',
          jobDescription: data?.jobDescription ?? '',
          startDate: data?.startDate ?? '',
          endDate: data?.endDate ?? '',
          type: data?.type ?? '',
          referenceName: data?.referenceName ?? '',
          referenceDesignation: data?.referenceDesignation ?? '',
          referenceContact: data?.referenceContact ?? ''
        })
        sub.unsubscribe();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }


  submit() {
    if (this.form.valid) {
      const data = this.form.value;
      data.started = changeDateToApiFormat(data.started);
      data.ended = changeDateToApiFormat(data.ended);
      data.applicationId = this.applicationId;
      if (this.id) {
        const sub = this.employmentHistoryService.createOrUpdateEmployment(data, this.id).subscribe({
          next: (res) => {
            this.close()
            sub.unsubscribe();
          },
          error: (res) => {
            sub.unsubscribe();
          },
        });
      } else {
        const sub = this.employmentHistoryService.createOrUpdateEmployment(data).subscribe({
          next: (res) => {
            this.close()
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