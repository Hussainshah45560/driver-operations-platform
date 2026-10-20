import { Component } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { LbAutoCompleteComponent } from '../../../core/lb-auto-complete/lb-auto-complete.component';
import { VMessageComponent } from '../../../core/v-message/v-message.component';
import { DatePickerComponent } from '../../../core/date-picker/date-picker.component';
import { lookupData, Recruitment } from '../../../core/modals';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Params } from '@angular/router';
import { LookupService } from '../../../_services/dataServices/lookup.service';
import { JobService } from '../../../_services/dataServices/job.service';

@Component({
  selector: 'app-my-job',
  standalone: true,
  imports: [ImportModule,
    LbAutoCompleteComponent,
    VMessageComponent, DatePickerComponent],
  templateUrl: './my-job.component.html',
  styleUrl: './my-job.component.scss'
})
export class MyJobComponent {
  form!: FormGroup;
  selectRegion: lookupData[] = [];
  selectCustomer: lookupData[] = [];
  selectCostCenter: lookupData[] = [];
  selectArea: lookupData[] = [];
  selectRecruitmentTypes: lookupData[] = [];
  selectRecruitmentModels: lookupData[] = [];
  selectDocumentType: lookupData[] = [];
  selectSkills: lookupData[] = [];
  id!: string;
  showPassword: boolean = false;
  data!: Recruitment;
  params: Params = {};
  selectedSkills: string[] = [];
  jobId: string = '';
  constructor(
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private jobService: JobService
  ) {


    this.form = this.formBuilder.group({
      customerId: ['', Validators.required],
      costCenterIds: ['', [Validators.required]],
      regionId: ['', Validators.required],
      areaIds: ['', Validators.required],
      site: ['', Validators.required],
      recruitmentModelId: ['', Validators.required],
      recruitmentTypeId: ['', Validators.required],
      availablePositions: ['', Validators.required],
      jobType: ['driver'],
      jobTitle: ['', Validators.required],
      jobDescription: ['', Validators.required],
      startDate: ['', Validators.required],
      isEndDate: [false],
      endDate: [''],
      skillIds: ['', Validators.required],
      type: [''],
      isInductionRequired: [false]

    });

    this.getRegionLookup();
    this.getRecruitmentTypeLookup();
    this.getRecruitmentModelLookup();
    this.getCustomersLookup();
    this.getSkillsLookup();
  }

  ngOnInit(): void {
    this.form.disable();
    this.jobId = JSON.parse(localStorage.getItem('_cookiesId') ?? '');
    if (this.jobId != '') {
      this.getSingleRecruitment(this.jobId);
     
    }
  }

  getSingleRecruitment(id: string) {
    const sub = this.jobService.getSingleJob(id).subscribe({
      next: (res) => {
        this.data = res.data;
        this.getCustomersLookup();
        this.getAreaLookup(this.data?.regionId);
        this.getCustomerCostCenters(this.data?.customerId);
        this.form.patchValue({
          customerId: this.data?.customerId ?? '',
          regionId: this.data?.regionId ?? '',
          areaIds: this.data?.areaIds ?? '',
          site: this.data?.site ?? '',
          recruitmentModelId: this.data?.recruitmentModelId ?? '',
          recruitmentTypeId: this.data?.recruitmentTypeId ?? '',
          availablePositions: this.data?.availablePositions ?? '',
          jobType: this.data?.jobType ?? '',
          jobTitle: this.data?.jobTitle ?? '',
          jobDescription: this.data?.jobDescription ?? '',
          startDate: this.data?.startDate ?? '',
          isEndDate: this.data?.isEndDate ?? false,
          endDate: this.data?.endDate ?? '',
          skillIds: this.data?.skillIds ?? [],
          isInductionRequired: this.data?.isInductionRequired ?? false,
          costCenterIds: this.data?.costCenterIds ?? []
        });

        this.selectedSkills = this.data?.skillIds

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

  getAreaLookup(regionId: string) {
    const sub = this.lookupService
      .getSettingsLookup('Areas', { region_id: regionId })
      .subscribe({
        next: (res) => {
          this.selectArea = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getRecruitmentTypeLookup() {
    const sub = this.lookupService.getSettingsLookup('RecruitmentTypes').subscribe({
      next: (res) => {
        this.selectRecruitmentTypes = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getRecruitmentModelLookup() {
    const sub = this.lookupService.getSettingsLookup('RecruitmentModels').subscribe({
      next: (res) => {
        this.selectRecruitmentModels = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getCustomersLookup(q: string = '') {
    let p: any = { q };
    if (this.data) {
      p['ex'] = this.data.customerId;
    }
    const sub = this.lookupService.getSettingsLookup('Customers', p).subscribe({
      next: (res) => {
        this.selectCustomer = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }



  getSkillsLookup() {
    const sub = this.lookupService.getSettingsLookup('Skills').subscribe({
      next: (res) => {
        this.selectSkills = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  showSelectedValues(event: any) {
    if (event) {
      this.selectedSkills = event;
    }
  }





  getNameByValue(value: string, arr: lookupData[]): string | undefined {
    const selectedArray = arr;
    const match = selectedArray.find((item) => item.value === value);
    return match ? match.name : undefined;
  }

  getCustomerCostCenters(id: string) {
    const sub = this.jobService.getCustomerCostCenters(id).subscribe({
      next: (res: any) => {
        this.selectCostCenter = res.data;

      },
      error: (res: any) => {
        sub.unsubscribe();
      },
    });
  }

  setBooleanValue(field: string, value?: string | boolean) {
    this.form.patchValue({ [field]: value });
    const control = this.form.get('endDate');
    if (value == true) {
      control?.setValidators(Validators.required);
      this
    } else if (value == false) {
      control?.clearValidators();
    }
    control?.updateValueAndValidity();
  }


  ngOnDestroy(): void {

  }
}