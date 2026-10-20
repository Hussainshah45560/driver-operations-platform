import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { lookupData } from '../../../../../core/modals';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { DatePickerComponent } from '../../../../../core/date-picker/date-picker.component';
import { RecruitmentsService } from '../../../../../_services/dataServices/recruitments.service';
import { changeDateToApiFormat } from '../../../../../core/utility';

@Component({
  selector: 'app-new-equipment',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent, DatePickerComponent],
  templateUrl: './new-equipment.component.html',
  styleUrl: './new-equipment.component.scss'
})
export class NewEquipmentComponent implements OnInit {
  form: FormGroup;
  selectEquipments: lookupData[] = [];
  selectedEquipments: string[] = [];
  selectStatus: lookupData[] = [{ name: 'Allocated', value: 'allocated' }, { name: 'Not Allocated', value: 'not allocated' }, { name: 'Returned', value: 'returned' }, { name: 'Not Returned', value: 'not returned' }];
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewEquipmentComponent>,
    private recruitmentService: RecruitmentsService,
    private lookupService: LookupService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {

    this.form = this.formBuilder.group({
      candidateName: ['', [Validators.required]],
      contactNumber: ['', [Validators.required]],
      status: ['', [Validators.required]],
      issueDate: ['', [Validators.required]],
      returnDate: [''],
      equipmentsIds: ['', [Validators.required]]
    });
    this.getEquipmentLookup();

    if (this.data) {
      if (this.data?.equipmentId != '') {
        this.getSingleEquipment(this.data?.equipmentId);
      }
      this.form.patchValue({
        candidateName: this.data?.name ?? '',
        contactNumber: this.data?.phoneNumber ?? '',
      });
    }

  }

  ngOnInit(): void {
  }

  getSingleEquipment(id: string) {
    const sub = this.recruitmentService.getSingleEquipment(id).subscribe({
      next: (res) => {
        let data = res.data;
        this.form.patchValue({
          candidateName: data?.candidateName ?? '',
          contactNumber: data?.contactNumber ?? '',
          status: data?.status ?? '',
          issueDate: data?.issueDate ?? '',
          returnDate: data?.returnDate ?? '',
          equipmentsIds: data?.equipmentIds ?? []
        })
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getEquipmentLookup() {
    const sub = this.lookupService.getSettingsLookup('AllowEquipments').subscribe({
      next: (res) => {
        this.selectEquipments = res.data
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  pushToArray(event: any) {
    this.selectedEquipments = event;
  }


  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      data.profileId = this.data?.profileId;
      data.issueDate = changeDateToApiFormat(data?.issueDate);
      data.returnDate = changeDateToApiFormat(data?.returnDate);
      data.equipmentIds = this.selectedEquipments;
      data.recruitmentId = this.data?.recruitmentId;
      delete data?.equipmentsIds;
      if (this.data?.equipmentId != '' && this.data?.equipmentId != undefined) {
        const sub = this.recruitmentService
          .issueEqipmentToCandidate(data, this.data?.equipmentId)
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
        const sub = this.recruitmentService.issueEqipmentToCandidate(data).subscribe({
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
