import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AreasService } from '../../../../../_services/dataServices/areas.service';
import { lookupData } from '../../../../../core/modals';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';

@Component({
  selector: 'app-new-area',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent],
  templateUrl: './new-area.component.html',
  styleUrl: './new-area.component.scss'
})
export class NewAreaComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  selectRegion: lookupData[] = [];
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewAreaComponent>,
    private areaService: AreasService,
    private lookupService: LookupService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      this.getSingleArea();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      regionId: ['', [Validators.required]]
    });
    this.getRegionLookup();

  }

  ngOnInit(): void {
  }

  getSingleArea() {
    const sub = this.areaService.getSingleArea(this._id).subscribe({
      next: (res) => {
        let data = res.data;
        this.form.patchValue({
          name: data?.name ?? '',
          regionId: data?.regionId ?? ''
        })
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getRegionLookup() {
    const sub = this.lookupService.getSettingsLookup('Regions').subscribe({
      next: (res) => {
       this.selectRegion = res.data
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
        const sub = this.areaService
          .createOrUpdateArea(data, this._id)
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
        const sub = this.areaService.createOrUpdateArea(data).subscribe({
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