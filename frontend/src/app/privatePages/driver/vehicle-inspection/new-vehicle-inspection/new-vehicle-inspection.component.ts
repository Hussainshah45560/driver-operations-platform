import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Checklist,
  lookupData,
  VehicleInspection,
} from '../../../../core/modals';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LookupService } from '../../../../_services/dataServices/lookup.service';
// import { VehicleInspectionService } from '../../../../_services/dataServices/vehicleInspection.service';
import { ImportModule } from '../../../../core/import/import.module';
import { LbAutoCompleteComponent } from '../../../../core/lb-auto-complete/lb-auto-complete.component';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { DatePickerComponent } from '../../../../core/date-picker/date-picker.component';
import { VehicleInspectionService } from '../../../../_services/dataServices/vehicleInspection.service';
// import { changeDateToApiFormat } from '../../../../core/utility';

@Component({
  selector: 'app-new-vehicle-inspection',
  standalone: true,
  imports: [
    ImportModule,
    LbAutoCompleteComponent,
    VMessageComponent,
    DatePickerComponent,
  ],
  templateUrl: './new-vehicle-inspection.component.html',
  styleUrl: './new-vehicle-inspection.component.scss',
})
export class NewVehicleInspectionComponent implements OnInit {
  form!: FormGroup;
  data!: VehicleInspection;
  vehicleCheckList!: Checklist[];

  uploads: {
    [key: string]: {
      file: File;
      name: string;
      size: string;
      loading: boolean;
      progress: number;
      loadingText: string;
    };
  } = {};
  images: any = [];
  selectDocumentType: lookupData[] = [];
  selectResult: lookupData[] = [
    { name: 'Passed', value: 'passed' },
    { name: 'Failed', value: 'failed' },
  ];
  documentIds: string[] = [];
  customerId!: string;
  id!: string;
  userId!: string;
  params: Params = {};
  sub: Subscription | undefined;
  isClickable: boolean = true;
  qSub: Subscription | undefined;
  checklistSelections: {
    [checklistId: string]: { [groupName: string]: string };
  } = {};
  // vehcileTestingData!: Induction['vehicleTesting'];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private vehicleInspectionService: VehicleInspectionService,
  ) {
    this.form = this.formBuilder.group({
      checklist: [''],
    });
    this.sub = this.route.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];

    });

    this.form = this.formBuilder.group({
      isTestCompleted: [false],
      testDate: [''],
      testResult: [''],
      type: [''],
      registrationNumber: ['', Validators.required],
      make: ['', Validators.required],
      model: ['', Validators.required],
      registrationDate: [''],
      licenseExpiryDate: ['', Validators.required],
      currentMileage: ['', Validators.required],
    });
    this.getDocumentTypeLookup();
  }
  ngOnInit(): void {
    this.getVehicleCheckList();
  }

  getVehicleInspection() {
    const sub = this.vehicleInspectionService.getVehicleInspection(this.id).subscribe({
      next: (res) => {
        this.data = res.data;
        this.form.disable();
        this.isClickable = false;
        this.form.patchValue({
          registrationNumber: this.data?.registrationNumber ?? '',
          make: this.data?.make ?? '',
          model: this.data?.model ?? '',
          registrationDate: this.data?.registrationDate ?? '',
          licenseExpiryDate: this.data?.licenseExpiryDate ?? '',
          currentMileage: this.data?.currentMileage ?? '',
          testDate: this.data?.testDate ?? '',
          testResult: this.data?.testResult ?? '',
        });
        this.patchSelectionsFromAPI(this.data?.checklist);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  setBooleanValue(field: string, value: boolean) {
    this.form.patchValue({ [field]: value });
  }

  patchSelectionsFromAPI(apiData: any) {
    if (this.vehicleCheckList) {
      apiData.forEach((apiChecklist: any) => {
        const localChecklist = this.vehicleCheckList.find(
          (item) => item._id === apiChecklist.checklistId,
        );
        if (!localChecklist) return;

        apiChecklist.group.forEach((apiGroup: any) => {
          const localGroup = localChecklist.groups.find(
            (g) => g.name === apiGroup.name,
          );
          if (localGroup) {
            // set selectedValue to API status
            localGroup.selectedValue = apiGroup.status;
          }
        });
      });
    }
  }

  onSubItemChange(checklistId: string, subItem: any, selectedValue: string) {
    // Assign the selected value to the subItem itself
    subItem.selectedValue = selectedValue ?? null;

    // Update centralized selections for API
    if (!this.checklistSelections[checklistId]) {
      this.checklistSelections[checklistId] = {};
    }
    this.checklistSelections[checklistId][subItem.name] = selectedValue;
  }

  customRequired(required: boolean, arr: string[]) {
    const fields = arr;
    fields.forEach((field) => {
      const control = this.form.get(field);
      if (control) {
        const existingValidators = control.validator ? [control.validator] : [];
        if (required == true) {
          control.setValidators([...existingValidators, Validators.required]);
        } else {
          control.clearValidators();
          if (field === 'mobilePhone' || field === 'homePhone') {
            control.setValidators([Validators.pattern(/^\+?[0-9]\d{9,14}$/)]);
          }
        }

        control.updateValueAndValidity();
      }
    });
  }

  getVehicleCheckList() {
    const sub = this.vehicleInspectionService
      .getCustomerCheckList({ type: 'vehicleCheck' })
      .subscribe({
        next: (res) => {
          this.vehicleCheckList = res.data?.checklists;
          this.getVehicleInspection();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getDocumentTypeLookup() {
    const sub = this.lookupService
      .getSettingsLookup('DocumentType', { type: 'Document' })
      .subscribe({
        next: (res) => {
          this.selectDocumentType = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  // getNameByValue(value: string, arr: lookupData[]): string | undefined {
  //   const selectedArray = arr;
  //   const match = selectedArray.find((item) => item.value === value);
  //   return match ? match.name : undefined;
  // }
  // selectImage(File: any, type: string) {
  //   this.images = [];
  //   const file = File[0];
  //   this.images.push(file);
  //   this.saveDocument();
  //   if (!this.uploads) this.uploads = {};
  //   this.uploads[type] = {
  //     file,
  //     name: file.name,
  //     size: (file.size / (1024 * 1024)).toFixed(2),
  //     loading: true,
  //     progress: 0,
  //     loadingText: 'Loading...',
  //   };
  //   const interval = setInterval(() => {
  //     const upload = this.uploads[type];
  //     if (!upload) return;

  //     if (upload.progress >= 100) {
  //       upload.progress = 100;
  //       upload.loadingText = 'Completed';
  //       clearInterval(interval);
  //     } else {
  //       upload.progress += 10;
  //       upload.loadingText = `${upload.progress}%`;
  //     }
  //   }, 60);
  // }
  goBack() {
    this.router.navigate(['induction']);
  }
  submit() {
    // if (this.inductionId) {
    //   const payload = Object.entries(this.checklistSelections).map(
    //     ([checklistId, groups]) => ({
    //       checklistId,
    //       group: Object.entries(groups).map(([name, status]) => ({
    //         name,
    //         status,
    //       })),
    //     }),
    //   );
    //   const data = Object.assign({}, this.form.value);
    //   if (data.testDate) {
    //     data.testDate = changeDateToApiFormat(data.testDate);
    //   }
    //   data.checklist = payload;
    //   delete data.type;
    //   const sub = this.vehicleInspectionService.subscribe({
    //     next: (res: any) => {
    //       this.router.navigate(['/induction', this.id, 'contract'], {
    //         queryParams: { inductionId: this.inductionId },
    //       });
    //       sub.unsubscribe();
    //     },
    //     error: (res) => {
    //       sub.unsubscribe();
    //     },
    //   });
    // }
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
