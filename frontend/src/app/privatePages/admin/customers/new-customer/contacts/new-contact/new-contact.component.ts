import { Component, Inject, Optional } from '@angular/core';
import { Contact } from '../../../../../../core/modals';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImportModule } from '../../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../../core/v-message/v-message.component';
import { CustomersService } from '../../../../../../_services/dataServices/customers.service';

@Component({
  selector: 'app-new-contact',
  standalone: true,
  imports: [ImportModule, VMessageComponent],
  templateUrl: './new-contact.component.html',
  styleUrl: './new-contact.component.scss',
})
export class NewContactComponent {
  form!: FormGroup;
  dataSource!: Contact;
  customerId!: string;
  id!: string;
  constructor(
    private customersService: CustomersService,
    @Optional() private dialogRef: MatDialogRef<NewContactComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    if (this.data) {
      this.customerId = this.data.customerId;
      this.id = this.data.id;
    }
    if (this.id != null) {
      this.getSingleContact();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      phoneNumber: ['', [Validators.required]],
      position: ['', [Validators.required]],
      isDefault: [false],
      isActive: [false]
    });
  }
  getSingleContact() {
    const sub = this.customersService.getSingleContact(this.id).subscribe({
      next: (res) => {
        this.dataSource = res.data;
        this.form.patchValue({
          name: res.data.name ?? '',
          email: res.data.email ?? '',
          phoneNumber: res.data.phoneNumber ?? '',
          isDefault: res.data.isDefault ?? false,
          position: res.data.position ?? '',
          isActive: res.data.isActive ?? false
        });
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  updateStatus() {
    const sub = this.customersService.updateContactStatus(this.id).subscribe({
      next: (res) => {
        this.getSingleContact();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }


  submit() {
    if (this.form.valid) {
      const data = this.form.value;
      data.customerId = this.customerId;
      if (this.id != '') {
        const sub = this.customersService
          .createOrUpdateContact(data, this.id)
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
        const sub = this.customersService.createOrUpdateContact(data).subscribe({
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
