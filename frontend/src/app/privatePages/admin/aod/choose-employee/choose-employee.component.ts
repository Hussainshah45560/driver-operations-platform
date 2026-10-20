import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupService } from '../../../../_services/dataServices/lookup.service';
import { lookupData } from '../../../../core/modals';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImportModule } from '../../../../core/import/import.module';
import { LbAutoCompleteComponent } from '../../../../core/lb-auto-complete/lb-auto-complete.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-choose-employee',
  standalone: true,
  imports: [ImportModule, LbAutoCompleteComponent],
  templateUrl: './choose-employee.component.html',
  styleUrl: './choose-employee.component.scss'
})
export class ChooseEmployeeComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  selectProfile: lookupData[] = [];
  type!: string;
  title!: string;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<ChooseEmployeeComponent>,
    private lookupService: LookupService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router
  ) {
    this.type = this.data.type;
    this.title = this.data?.title ?? '';
    this.form = this.formBuilder.group({
      profileId: ['', [Validators.required]]
    });
    this.getProfileLookup();

  }

  ngOnInit(): void {
  }



  getProfileLookup(q: string = '') {
    let p: any = { q };
    if (this.type === 'booking') {
      p.type = 'all';
    }
    const sub = this.lookupService.getSettingsLookup('UserProfiles', p).subscribe({
      next: (res) => {
        this.selectProfile = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  submit() {
    if (this.form.valid) {
      if (this.type == 'aod') {
        this.router.navigate(['aod/new/' + this.form.value.profileId]);
      } else if (this.type == 'disciplinary') {
        this.router.navigate(['disciplinary/new'], { queryParams: { profileId: this.form.value.profileId } });
      } else if (this.type == 'offBoarding') {
        this.router.navigate(['offBoarding/new'], { queryParams: { profileId: this.form.value.profileId } });
      } else if (this.type == 'booking') {
        this.router.navigate(['tests/new'], { queryParams: { profileId: this.form.value.profileId } });
      }

      this.close();
    } else {
      this.form.markAllAsTouched();
    }
  }

  close() {
    this.dialogRef.close();
  }


}