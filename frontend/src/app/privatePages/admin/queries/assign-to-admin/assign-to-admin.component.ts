import { Component, Inject, OnInit, Optional } from '@angular/core';
import { LbAutoCompleteComponent } from '../../../../core/lb-auto-complete/lb-auto-complete.component';
import { ImportModule } from '../../../../core/import/import.module';
import { lookupData } from '../../../../core/modals';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LookupService } from '../../../../_services/dataServices/lookup.service';
import { QueriesService } from '../../../../_services/dataServices/queries.service';

@Component({
  selector: 'app-assign-to-admin',
  standalone: true,
  imports: [ImportModule, LbAutoCompleteComponent],
  templateUrl: './assign-to-admin.component.html',
  styleUrl: './assign-to-admin.component.scss'
})
export class AssignToAdminComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  selectAdmin: lookupData[] = [];
  type!: string;
  queryIds: string[] = [];
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<AssignToAdminComponent>,
    private lookupService: LookupService,
    private queriesService: QueriesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.queryIds = this.data.queryIds;
    this.form = this.formBuilder.group({
      assignTo: ['', [Validators.required]]
    });
    this.getAdminLookup();

  }

  ngOnInit(): void {
  }



  getAdminLookup(q: string = '') {
    let p: any = { q };
    const sub = this.lookupService.getSettingsLookup('Admins', p).subscribe({
      next: (res) => {
        this.selectAdmin = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      data.queryIds = this.queryIds ?? [];
      const sub = this.queriesService.assignToAdmin(data).subscribe({
        next: (res) => {
          this.selectAdmin = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
      this.close();
    } else {
      this.form.markAllAsTouched();
    }
  }

  close() {
    this.dialogRef.close();
  }

}