import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { ImportModule } from '../../../../core/import/import.module';
import { RecruitmentsService } from '../../../../_services/dataServices/recruitments.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DatePickerComponent } from '../../../../core/date-picker/date-picker.component';
import { changeDateToApiFormat } from '../../../../core/utility';
import { CandidateDetails } from '../../../../core/modals';

@Component({
  selector: 'app-candidate-details',
  standalone: true,
  imports: [ImportModule, VMessageComponent, DatePickerComponent],
  templateUrl: './candidate-details.component.html',
  styleUrl: './candidate-details.component.scss'
})
export class CandidateDetailsComponent implements OnInit {
  form: FormGroup;
  id: string = '';
  dataSource!: CandidateDetails;
  purpose!: string;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<CandidateDetailsComponent>,
    private recruitmentService: RecruitmentsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.form = this.formBuilder.group({
      nickName: [''],
      firstName: [''],
      lastName: [''],
      residentialArea: [''],
      idNumber: [''],
      phoneNumber: ['', [Validators.pattern(/^\+?[0-9]\d{9,14}$/)]],
      contactedDate: [''],
      trainingDate: [''],
      trainingCompletionDate: [''],
      applicationCategory: ['']

    });
    if (this.data.id) {
      this.id = this.data.id;
      this.purpose = this.data?.purpose;
      if (this.purpose == 'view') {
        this.form.disable();
      }
      this.getCandidateDetails()
    }
  }
  ngOnInit(): void {

  }

  setFormToEdit() {
    this.form.enable();
    this.purpose = 'update';
  }

  setBooleanValue(field: string, value?: string | boolean) {
    this.form.patchValue({ [field]: value });
  }

  getCandidateDetails() {
    const sub = this.recruitmentService
      .getCandidateDetails({ application_id: this.id })
      .subscribe({
        next: (res) => {
          this.dataSource = res.data;
          this.form.patchValue({
            nickName: this.dataSource?.nickName ?? '',
            firstName: this.dataSource?.firstName ?? '',
            lastName: this.dataSource?.lastName ?? '',
            residentialArea: this.dataSource?.region ?? '',
            idNumber: this.dataSource?.idNumber ?? '',
            phoneNumber: this.dataSource?.phoneNumber ?? '',
            contactedDate: this.dataSource?.contactedDate ?? '',
            trainingDate: this.dataSource?.trainingDate ?? '',
            trainingCompletionDate: this.dataSource?.trainingCompletionDate ?? '',
            applicationCategory: this.dataSource?.applicationCategory ?? '',
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
      data.trainingDate = changeDateToApiFormat(data.trainingDate);
      data.trainingCompletionDate = changeDateToApiFormat(data.trainingCompletionDate);
      data.contactedDate = changeDateToApiFormat(data?.contactedDate);
      const keysToRemove = [
        'nickName',
        'firstName',
        'residentialArea',
        'idNumber',
        'phoneNumber',
        'lastName'
      ];

      keysToRemove.forEach((key) => delete data[key]);
      const sub = this.recruitmentService.updateCandidateDetails(this.id, data).subscribe({
        next: (res) => {
          this.close();
          sub.unsubscribe();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  close() {
    this.dialogRef.close();
  }

}
