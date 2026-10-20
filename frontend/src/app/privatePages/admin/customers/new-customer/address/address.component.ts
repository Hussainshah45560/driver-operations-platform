import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { lookupData } from '../../../../../core/modals';
import { Subscription } from 'rxjs';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { CustomersService } from '../../../../../_services/dataServices/customers.service';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss',
})
export class AddressComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  stepData !: any;
  selectRegion: lookupData[] = [];
  id!: string;
  params: Params = {};
  sub: Subscription | undefined;
  constructor(private formBuilder: FormBuilder, private router: Router,
    private lookupService: LookupService,
    private customerService: CustomersService,
    private route: ActivatedRoute
  ) {
    this.form = this.formBuilder.group({
      line1: ['', [Validators.required]],
      line2: [''],
      suburb: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      regionId: ['', [Validators.required]],
      postalline1: ['', [Validators.required]],
      postalline2: [''],
      postalsuburb: ['', [Validators.required]],
      postalzipCode: ['', [Validators.required]],
      postalregionId: ['', [Validators.required]],
      sameAs: [false],
    });
    this.sub = this.route.parent?.params.subscribe(params => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getCustomerStep2();
      }
    });
    this.getRegionLookup();
  }
  ngOnInit(): void {

  }

  getCustomerStep2() {
    const sub = this.customerService
      .getCustomerData(this.id, '2')
      .subscribe({
        next: (res) => {
          this.stepData = res.data;
          this.form.patchValue({
            line1: this.stepData?.physicalAddress?.line1 ?? '',
            line2: this.stepData?.physicalAddress?.line2 ?? '',
            suburb: this.stepData?.physicalAddress?.suburb ?? '',
            zipCode: this.stepData?.physicalAddress?.zipCode ?? '',
            regionId: this.stepData?.physicalAddress?.regionId ?? '',
            postalline1: this.stepData?.postalAddress?.line1 ?? '',
            postalline2: this.stepData?.postalAddress?.line2 ?? '',
            postalsuburb: this.stepData?.postalAddress?.suburb ?? '',
            postalzipCode: this.stepData?.postalAddress?.zipCode ?? '',
            postalregionId: this.stepData?.postalAddress?.regionId ?? '',
            sameAs: this.stepData?.postalAddress?.sameAsPhysicalAddress ?? false
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

  updateStatus() {
    const sub = this.customerService.updateCustomerStatus(this.id).subscribe({
      next: (res) => {
        this.getCustomerStep2();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  

  sameAs() {
    let formData = this.form.value;
    if (formData.sameAs == true) {
      this.form.patchValue({
        postalline1: formData?.line1,
        postalline2: formData?.line2,
        postalsuburb: formData?.suburb,
        postalzipCode: formData?.zipCode,
        postalregionId: formData?.regionId,
      })
    } else {
      this.form.patchValue({
        postalline1: '',
        postalline2: '',
        postalsuburb: '',
        postalzipCode: '',
        postalregionId: '',
      })
    }
  }
  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      data.physicalAddress = {
        "line1": data.line1,
        "line2": data.line2,
        "suburb": data.suburb,
        "regionId": data.regionId,
        "zipCode": data.zipCode,
      }
      data.postalAddress = {
        "sameAsPhysicalAddress": data.sameAs,
        "line1": data.postalline1,
        "line2": data.postalline2,
        "suburb": data.postalsuburb,
        "regionId": data.postalregionId,
        "zipCode": data.postalzipCode,
      }
      const keysToRemove = [
        'postalline1',
        'postalline2',
        'postalsuburb',
        'postalregionId',
        'postalzipCode',
        'line1',
        'line2',
        'sameAs',
        'suburb',
        'regionId',
        'zipCode'
      ];
      keysToRemove.forEach(key => delete data[key]);
      const sub = this.customerService.createOrUpdateCustomer(data, 'Step2', this.id).subscribe({
        next: (res) => {
          this.router.navigate(['/customers/edit/' + this.id + '/contacts']);
          sub.unsubscribe();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
    }
    else {
      this.form.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
