import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { lookupData } from '../../../../../core/modals';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { SubDevicesService } from '../../../../../_services/dataServices/subDevices.service';

@Component({
  selector: 'app-new-device',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent],
  templateUrl: './new-device.component.html',
  styleUrl: './new-device.component.scss'
})
export class NewDeviceComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  selectVehicleType: lookupData[] = [];
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewDeviceComponent>,
    private subDevicesService: SubDevicesService,
    private lookupService: LookupService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      this.getSingleSubDevice();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      vehicleTypeId: ['', [Validators.required]]
    });
    this.getVehicleTypeLookup();

  }

  ngOnInit(): void {
  }

  getSingleSubDevice() {
    const sub = this.subDevicesService.getSingleSubDevice(this._id).subscribe({
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
        const sub = this.subDevicesService
          .createOrUpdateSubDevice(data, this._id)
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
        const sub = this.subDevicesService.createOrUpdateSubDevice(data).subscribe({
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