import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { Customer, lookupData } from '../../../../../core/modals';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { CustomersService } from '../../../../../_services/dataServices/customers.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  stepData !: Customer;
  selectRegion: lookupData[] = [];
  selectCostCenter: lookupData[] = [];
  id!: string;
  params: Params = {};
  sub: Subscription | undefined;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private customerService: CustomersService,
    private route: ActivatedRoute
  ) {
    this.form = this.formBuilder.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      telNumber: [''],
      // phoneNumber: ['', Validators.required],
      // faxNumber: [''],
      tradingAs: ['', Validators.required],
      companyRegNumber: ['', Validators.required],
      regionId: ['', Validators.required],
      vatNumber: ['', Validators.required],
      vatPercentage: ['', Validators.required],
      costCenterIds: ['']
    });
    this.getRegionLookup();
    this.getCostCenterLookup();
    this.sub = this.route.parent?.params.subscribe(params => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getCustomerStep1();
      }
    });
  }
  ngOnInit(): void { }

  getCustomerStep1() {
    const sub = this.customerService
      .getCustomerData(this.id, '1')
      .subscribe({
        next: (res) => {
          this.stepData = res.data;
          this.form.patchValue({
            code: this.stepData?.code ?? '',
            name: this.stepData?.name ?? '',
            email: this.stepData?.email ?? '',
            telNumber: this.stepData?.telNumber ?? '',
            // phoneNumber: this.stepData?.phoneNumber ?? '',
            // faxNumber: this.stepData?.faxNumber ?? '',
            tradingAs: this.stepData?.tradingAs ?? '',
            companyRegNumber: this.stepData?.companyRegNumber ?? '',
            regionId: this.stepData?.regionId ?? '',
            vatNumber: this.stepData?.vatNumber ?? '',
            vatPercentage: this.stepData?.vatPercentage ?? '',
            costCenterIds: this.stepData?.costCenterIds ?? ''
          })
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getRegionLookup() {
    const sub = this.lookupService
      .getSettingsLookup('Regions')
      .subscribe({
        next: (res) => {
          this.selectRegion = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }
  
  getCostCenterLookup() {
    const sub = this.lookupService
      .getSettingsLookup('CostCenters')
      .subscribe({
        next: (res) => {
          this.selectCostCenter = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  updateStatus() {
    const sub = this.customerService.updateCustomerStatus(this.id).subscribe({
      next: (res) => {
        this.getCustomerStep1();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  goBack() {
    this.router.navigate(['customers']);
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.value;
      data.code = Number(data.code);
      data.vatNumber = Number(data.vatNumber);
      data.vatPercentage = Number(data.vatPercentage);
      if (this.id != '' && this.id != undefined) {
        const sub = this.customerService
          .createOrUpdateCustomer(data, 'step1', this.id)
          .subscribe({
            next: (res) => {
              this.router.navigate(['/customers/edit/' + this.id + '/address']);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {
        const sub = this.customerService.createOrUpdateCustomer(data, 'step1').subscribe({
          next: (res: any) => {
            this.id = res.data.customerId
            this.router.navigate(['/customers/edit/' + this.id + '/address']);
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
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
