import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { lookupData } from '../../../../../core/modals';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { AccessoriesService } from '../../../../../_services/dataServices/accessories.service';

@Component({
  selector: 'app-new-accessory',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent],
  templateUrl: './new-accessory.component.html',
  styleUrl: './new-accessory.component.scss'
})
export class NewAccessoryComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  selectVehicleType: lookupData[] = [];
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewAccessoryComponent>,
    private accessoryService: AccessoriesService,
    private lookupService: LookupService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      this.getSingleAccessory();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      vehicleTypeId: ['', [Validators.required]]
    });
    this.getVehicleTypeLookup();

  }

  ngOnInit(): void {
  }

  getSingleAccessory() {
    const sub = this.accessoryService.getSingleAccessory(this._id).subscribe({
      next: (res) => {
        let data = res.data;
        this.form.patchValue({
          name: data?.name ?? '',
          vehicleTypeId: data?.vehicleTypeId ?? ''
        })
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getVehicleTypeLookup() {
    const sub = this.lookupService.getSettingsLookup('VehicleTypes').subscribe({
      next: (res) => {
        this.selectVehicleType = res.data
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
        const sub = this.accessoryService
          .createOrUpdateAccessory(data, this._id)
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
        const sub = this.accessoryService.createOrUpdateAccessory(data).subscribe({
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