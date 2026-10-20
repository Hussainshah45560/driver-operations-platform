import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { BankingDetails, lookupData } from '../../../core/modals';
import { LbAutoCompleteComponent } from '../../../core/lb-auto-complete/lb-auto-complete.component';
import { VMessageComponent } from '../../../core/v-message/v-message.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupService } from '../../../_services/dataServices/lookup.service';
import { BankingDetailsService } from '../../../_services/dataServices/bankingDetails.service';
import { AuthService } from '../../../_services/common/auth.service';

@Component({
  selector: 'app-banking-details',
  standalone: true,
  imports: [ImportModule, LbAutoCompleteComponent, VMessageComponent],
  templateUrl: './banking-details.component.html',
  styleUrl: './banking-details.component.scss',
})
export class BankingDetailsComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  selectAccountType: lookupData[] = [];
  dataSource!: BankingDetails;
  selectBank: lookupData[] = [];
  userId!: string;
  edit: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private bankingDetailsService: BankingDetailsService,
    private authService: AuthService
  ) {
    this.form = this.formBuilder.group({
      bankNameId: ['', Validators.required],
      branchCode: ['', Validators.required],
      accountNumber: ['', Validators.required],
      accountTypeId: ['', Validators.required],
      branchName: ['', Validators.required]
    });
    this.userId = this.authService.userDetails?._id ?? '';
    this.getAccountTypeLookup();
    this.getBankingDetails();
    this.getBankLookup();
    if (!this.edit) {
      this.form.disable();
    }
  }
  ngOnInit(): void { }

  getAccountTypeLookup() {
    const sub = this.lookupService.getSettingsLookup('AccountType').subscribe({
      next: (res) => {
        this.selectAccountType = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getBankLookup() {
    const sub = this.lookupService.getSettingsLookup('Banks').subscribe({
      next: (res) => {
        this.selectBank = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  patchBranchCode(event: any) {
    let obj = this.selectBank.find(i => i.value === event);
    this.form.patchValue({
      branchCode: obj?.code ?? ''
    })
  }

  getBankingDetails() {
    const sub = this.bankingDetailsService.getBankingDetails().subscribe({
      next: (res) => {
        this.dataSource = res.data.bankDetails;
        this.form.patchValue({
          bankNameId: this.dataSource?.bankNameId ?? '',
          branchCode: this.dataSource?.branchCode ?? '',
          branchName: this.dataSource?.branchName ?? '',
          accountNumber: this.dataSource?.accountNumber ?? '',
          accountTypeId: this.dataSource?.accountTypeId ?? '',
        })
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  editForm() {
    this.edit = !this.edit;
    if (this.edit == true) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }

  submit() {
    if (this.form.valid) {
      let data = Object.assign({});
      data.bankDetails = {};
      data.bankDetails.bankNameId = this.form.value.bankNameId ?? '';
      data.bankDetails.branchCode = this.form.value.branchCode ?? '';
      data.bankDetails.branchName = this.form.value.branchName ?? '';
      data.bankDetails.accountNumber = this.form.value.accountNumber ?? '';
      data.bankDetails.accountTypeId = this.form.value.accountTypeId ?? '';

      if (this.userId != null && this.userId != undefined) {
        const sub = this.bankingDetailsService
          .createOrUpdateBankingDetails(data, this.userId)
          .subscribe({
            next: (res) => {
              this.editForm();
              this.getBankingDetails();

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


  ngOnDestroy(): void { }
}
