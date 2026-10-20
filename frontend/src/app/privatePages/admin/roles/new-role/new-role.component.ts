import { Component, Inject, OnInit, Optional } from '@angular/core';
import { RolesService } from '../../../../_services/dataServices/roles.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../core/import/import.module';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';

@Component({
  selector: 'app-new-role',
  standalone: true,
  imports: [ImportModule, VMessageComponent],
  templateUrl: './new-role.component.html',
  styleUrl: './new-role.component.scss'
})
export class NewRoleComponent implements OnInit {
  form: FormGroup;
  id: string = '';
  itemList: any;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewRoleComponent>,
    private rolesService: RolesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]]
    });
    if (this.data.id) {
      this.id = this.data.id;
    }
  }
  ngOnInit(): void {

  }


  submit() {
    if (this.form.valid) {
      const data = this.form.value;
        data.permissions = { lookup: { view: true }, dashboard: { view: true } };
      const sub = this.rolesService.createOrUpdateRole(data).subscribe({
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
