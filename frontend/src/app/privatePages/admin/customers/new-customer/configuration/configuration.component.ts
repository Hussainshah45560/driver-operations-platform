import { Component } from '@angular/core';
import { ImportModule } from '../../../../../core/import/import.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { Customer, lookupData } from '../../../../../core/modals';
import { CustomersService } from '../../../../../_services/dataServices/customers.service';
import { Subscription } from 'rxjs';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [ImportModule, LbAutoCompleteComponent],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss'
})
export class ConfigurationComponent {
  form!: FormGroup;
  id!: string;
  stepData !: Customer;
  params: Params = {};
  sub: Subscription | undefined;
  configurations: any;
  selectDocuments: lookupData[] = [];
  selectVehicle: lookupData[] = [];
  selectDriver: lookupData[] = [];
  selectCheckList: lookupData[] = [];
  constructor(private router: Router, private formBuilder: FormBuilder, private customerService: CustomersService, private lookupService: LookupService,
    private route: ActivatedRoute) {
    this.form = this.formBuilder.group({
      supportingDocs: [false],
      vehicleCheck: [false],
      driverCheck: [false],
      checklistRequired: [false],
      checklistIds: [''],
      driverCheckIds: [''],
      vehicleCheckIds: [''],
      supportingDocIds: ['']
    });
    this.sub = this.route.parent?.params.subscribe(params => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getCustomerStep4();
      }
    });
    this.getSupportingDocsLookup();
    this.getDriverLookup();
    this.getVehicleLookup();
    this.getCheckListLookup();
  }


  getCustomerStep4() {
    const sub = this.customerService
      .getCustomerData(this.id, '4')
      .subscribe({
        next: (res) => {
          this.stepData = res.data;
          this.configurations = this.stepData.configuration;
          this.stepData.configuration?.forEach((item) => {
            switch (item.checkListType) {

              case 'supportingDocs':
                this.form.patchValue({
                  supportingDocs: true,
                  supportingDocIds: item.supportingDocs || []
                });
                break;
              case 'vehicleCheck':
                this.form.patchValue({
                  vehicleCheck: true,
                  vehicleCheckIds: item.checkListIds || []
                });
                break;
              case 'driverCheck':
                this.form.patchValue({
                  driverCheck: true,
                  driverCheckIds: item.checkListIds || []
                });
                break;
                case 'checklistRequired':
                this.form.patchValue({
                  checklistRequired: true,
                  checklistIds: item.checkListIds || []
                });
                break;
            }

          })
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }


  onToggle(type: string) {
    this.configurations = this.configurations || [];
    const isChecked = this.form.get(type)?.value;
    if (!isChecked) {
      this.configurations = this.configurations.filter((item: any) => item.checkListType !== type);
    } else {
      this.updateArray(type);
    }

  }

  getSupportingDocsLookup() {
    const sub = this.lookupService
      .getSettingsLookup('SupportingDocs')
      .subscribe({
        next: (res) => {
          this.selectDocuments = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getCheckListLookup() {
    const sub = this.lookupService
      .getSettingsLookup('CheckList', { checklist: 'General Checklist' })
      .subscribe({
        next: (res) => {
          this.selectCheckList = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getDriverLookup() {
    const sub = this.lookupService
      .getSettingsLookup('CheckList', { checklist: 'Driver Inspection' })
      .subscribe({
        next: (res) => {
          this.selectDriver = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getVehicleLookup() {
    const sub = this.lookupService
      .getSettingsLookup('CheckList', { checklist: 'Vehicle Inspection' })
      .subscribe({
        next: (res) => {
          this.selectVehicle = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  updateArray(type: string) {
    const enabled = this.form.get(type)?.value;
    let inputValue: any;
    if (type === 'driverCheck') {
      inputValue = this.form.value.driverCheckIds;
    } else if (type === 'supportingDocs') {
      inputValue = this.form.value.supportingDocIds;
    } else if (type === 'vehicleCheck') {
      inputValue = this.form.value.vehicleCheckIds;
    }else if (type === 'checklistRequired') {
      inputValue = this.form.value.checklistIds;
    }
  
    if (type == 'driverCheck' || type == 'supportingDocs' || type == 'vehicleCheck' || type == 'checklistRequired') {
      const existingIndex = this.configurations.findIndex((item: any) => item.checkListType === type);
      if (!enabled) {
        if (existingIndex !== -1) this.configurations.splice(existingIndex, 1);
        return;
      }
      const hasValue =
        (Array.isArray(inputValue) && inputValue.length > 0) ||
        (!!inputValue && !Array.isArray(inputValue));
      if (!hasValue) {
        if (existingIndex !== -1) this.configurations.splice(existingIndex, 1);
        return;
      }

      const newObj: any = { checkListType: type };
      if (type === 'driverCheck') {
        newObj.checkListIds = Array.isArray(inputValue) ? inputValue : [inputValue];
      } else if (type === 'supportingDocs') {
        newObj.supportingDocs = Array.isArray(inputValue) ? inputValue : [inputValue];
      } else if (type === 'vehicleCheck') {
        newObj.checkListIds = Array.isArray(inputValue) ? inputValue : [inputValue];
      }else if (type === 'checklistRequired') {
        newObj.checkListIds = Array.isArray(inputValue) ? inputValue : [inputValue];
      }
      if (existingIndex !== -1) {
        this.configurations[existingIndex] = newObj;
      } else {
        this.configurations.push(newObj);
      }
    }
   
  }



  updateStatus() {
    const sub = this.customerService.updateCustomerStatus(this.id).subscribe({
      next: (res) => {
        this.getCustomerStep4();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  goBack() {
    this.router.navigate(['customers']);
  }


  customRequired(required: boolean, arr: string[]) {
    const fields = arr;
    fields.forEach(field => {
      const control = this.form.get(field);
      if (control) {
        const existingValidators = control.validator ? [control.validator] : [];
        if (required == true) {
          control.setValidators([...existingValidators, Validators.required]);
        } else {
          control.clearValidators();

        }
        control.updateValueAndValidity();
      }
    });
  }

  submit() {
    if (this.form.valid) {
      const data = Object.assign({});
      data.configuration = this.configurations || [];
      const sub = this.customerService.createOrUpdateCustomer(data, 'Step4', this.id).subscribe({
        next: (res) => {
          this.router.navigate(['/customers']);
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

}
