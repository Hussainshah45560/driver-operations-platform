import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CostCentersService } from '../../../../../_services/dataServices/costCenters.service';

@Component({
  selector: 'app-new-center',
  standalone: true,
  imports: [ImportModule, VMessageComponent],
  templateUrl: './new-center.component.html',
  styleUrl: './new-center.component.scss'
})
export class NewCenterComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  itemList: any;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewCenterComponent>,
    private costCenterService: CostCentersService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      this.getSingleCostCenters();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]]
    });

  }

  ngOnInit(): void {
  }

  getSingleCostCenters() {
    const sub = this.costCenterService.getSingleCostCenters(this._id).subscribe({
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
        const sub = this.costCenterService
          .createOrUpdateCostCenters(data, this._id)
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
        const sub = this.costCenterService.createOrUpdateCostCenters(data).subscribe({
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