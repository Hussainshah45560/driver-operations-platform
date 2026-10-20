import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BanksService } from '../../../../../_services/dataServices/banks.service';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { ImportModule } from '../../../../../core/import/import.module';

@Component({
  selector: 'app-new-bank',
  standalone: true,
  imports: [ImportModule, VMessageComponent],
  templateUrl: './new-bank.component.html',
  styleUrl: './new-bank.component.scss'
})
export class NewBankComponent implements OnInit {
  form: FormGroup;
  _id: string = '';
  itemList: any;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewBankComponent>,
    private bankService: BanksService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data.id) {
      this._id = this.data.id;
      this.getSingleAccountType();
    }
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      code: ['', [Validators.required]],
    });
  }

  ngOnInit(): void { }

  getSingleAccountType() {
    const sub = this.bankService
      .getSingleBank(this._id)
      .subscribe({
        next: (res) => {
          let data = res.data;
          this.form.patchValue({
            name: data?.name ?? '',
            code: data?.code ?? '',
          });
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
        const sub = this.bankService
          .createOrUpdateBank(data, this._id)
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
        const sub = this.bankService
          .createOrUpdateBank(data)
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
