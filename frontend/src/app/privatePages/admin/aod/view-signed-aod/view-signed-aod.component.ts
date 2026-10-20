import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ImportModule } from '../../../../core/import/import.module';
import { SignComponent } from '../../../../core/sign/sign.component';
import { DatePickerComponent } from '../../../../core/date-picker/date-picker.component';
import { AodsService } from '../../../../_services/dataServices/aods.service';
import { changeDateToApiFormat } from '../../../../core/utility';

@Component({
  selector: 'app-view-signed-aod',
  standalone: true,
  imports: [ImportModule, SignComponent, DatePickerComponent],
  templateUrl: './view-signed-aod.component.html',
  styleUrl: './view-signed-aod.component.scss'
})
export class ViewSignedAodComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  templateData: any;
  isDisabled: boolean = false;
  isUserDisabled: boolean = true;
  adminSignUrl!: '';
  userSignUrl!: '';
  apiData: any;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<ViewSignedAodComponent>,
    private aodService: AodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer
  ) {
    if (this.data?._id) {
      this.getTemplateData(this.data._id);
    }
    this.form = this.formBuilder.group({
      adminSignDate: [''],
      adminSign: [''],
      userSign: [''],
      userSignDate: [''],
    });

  }

  ngOnInit(): void {
  }

  patchSign(event: any, type: string) {
    if (type == 'admin') {
      this.adminSignUrl = event;
      this.form.patchValue({
        adminSign: event
      });
    } else {
      this.userSignUrl = event;
      this.form.patchValue({
        userSign: event
      });
    }
  }
  getTemplateData(id: string) {
    const sub = this.aodService.getTemplateToSign(id).subscribe({
      next: (res) => {
        this.apiData = res.data;
        this.templateData = this.sanitizer.bypassSecurityTrustHtml(this.apiData?.template || '');
        if (this.apiData?.signature?.adminSign != null) {
          this.isDisabled = true;
        }
        this.form.patchValue({
          adminSignDate: this.apiData?.signature?.adminSignDate ?? '',
          adminSign: this.apiData?.signature?.adminSign ?? '',
          userSign: this.apiData?.signature?.userSign ?? '',
          userSignDate: this.apiData?.signature?.userSignDate ?? '',
        });
        // this.form.disable();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  submit() {
    if (this.form.value.adminSign != '' && this.form.value.adminSignDate != '') {
      const data = Object.assign({}, this.form.value);
      data.adminSign = this.adminSignUrl;
      data.adminSignDate = changeDateToApiFormat(data?.adminSignDate);
      delete data.userSign;
      delete data.userSignDate
      if (this.data._id != '' && this.data._id != undefined) {
        const sub = this.aodService
          .saveSignedTemplate(data, this.data._id)
          .subscribe({
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