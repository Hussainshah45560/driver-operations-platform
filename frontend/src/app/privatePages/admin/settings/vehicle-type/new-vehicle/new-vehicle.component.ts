import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VehicleTypesService } from '../../../../../_services/dataServices/vehicleTypes.service';

@Component({
  selector: 'app-new-vehicle',
  standalone: true,
  imports: [ImportModule, VMessageComponent],
  templateUrl: './new-vehicle.component.html',
  styleUrl: './new-vehicle.component.scss'
})
export class NewVehicleComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  itemList: any;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewVehicleComponent>,
    private regionService: VehicleTypesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      this.getSingleVehicleType();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]]
    });

  }

  ngOnInit(): void {
  }

  getSingleVehicleType() {
    const sub = this.regionService.getSingleVehicleType(this._id).subscribe({
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
        const sub = this.regionService
          .createOrUpdateVehicleType(data, this._id)
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
        const sub = this.regionService.createOrUpdateVehicleType(data).subscribe({
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