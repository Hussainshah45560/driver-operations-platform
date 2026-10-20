import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ImportModule } from '../../../../core/import/import.module';
import { LbAutoCompleteComponent } from '../../../../core/lb-auto-complete/lb-auto-complete.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { LookupService } from '../../../../_services/dataServices/lookup.service';
import { Documents, lookupData, Recruitment } from '../../../../core/modals';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { filter, Subscription, switchMap } from 'rxjs';
import { DatePickerComponent } from '../../../../core/date-picker/date-picker.component';
import { RecruitmentsService } from '../../../../_services/dataServices/recruitments.service';
import { changeDateToApiFormat } from '../../../../core/utility';
import { DragComponent } from '../../../../core/drag/drag.component';
import { FileSaverService } from '../../../../_services/common/fileSaver.service';
import { MessageService } from '../../../../_services/common/message.service';

@Component({
  selector: 'app-new-recruitment',
  standalone: true,
  imports: [ImportModule,
    LbAutoCompleteComponent,
    VMessageComponent, DatePickerComponent, DragComponent],
  templateUrl: './new-recruitment.component.html',
  styleUrl: './new-recruitment.component.scss'
})
export class NewRecruitmentComponent implements OnInit, OnDestroy {
  @Input() recruitmentId: string = '';
  form!: FormGroup;
  @Output() sendToParent = new EventEmitter<any>();
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
  routSub: Subscription;
  selectedSkills: string[] = [];
  images: any = [];
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
  dataSource: Documents[] = [];
  documentIds: string[] = [];
  constructor(
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private route: ActivatedRoute,
    private router: Router,
    private recruitmentService: RecruitmentsService,
    private fileSaverService: FileSaverService,
    private messageService: MessageService
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


    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getSingleRecruitment(this.id);
      }
    });


    this.getRegionLookup();
    this.getRecruitmentTypeLookup();
    this.getRecruitmentModelLookup();
    this.getCustomersLookup();
    this.getSkillsLookup();
    this.getDocumentTypeLookup();
  }

  ngOnInit(): void {
    if (this.recruitmentId != '') {
      this.getSingleRecruitment(this.recruitmentId);
      this.form.disable();
    }
  }

  getSingleRecruitment(id: string) {
    const sub = this.recruitmentService.getSingleRecruitment(id).subscribe({
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
        this.customRequired(this.data?.isEndDate, ['endDate']);
        this.getAllDocuments();
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
          if (field === 'mobilePhone' || field === 'homePhone') {
            control.setValidators([Validators.pattern(/^\+?[0-9]\d{9,14}$/)]);
          }
        }

        control.updateValueAndValidity();
      }
    });
  }

  onChange(value: string, checked: boolean) {
    if (!checked) {
      this.selectedSkills = this.selectedSkills.filter((item) => item != value);
    }
    const skills = this.form.get('skillIds')?.value || [];

    const updated = skills.filter((item: string) => item !== value);

    this.form.get('skillIds')?.setValue(updated);
  }

  getNameByValue(value: string, arr: lookupData[]): string | undefined {
    const selectedArray = arr;
    const match = selectedArray.find((item) => item.value === value);
    return match ? match.name : undefined;
  }

  getCustomerCostCenters(id: string) {
    const sub = this.recruitmentService.getCustomerCostCenters(id).subscribe({
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

  setInductionValue(field: 'isInductionRequired', value: boolean) {
    this.form.patchValue({ [field]: value });
  }

  selectImage(File: any, type: string) {
    this.images = [];
    const file = File[0];
    this.images.push(file);
    this.saveDocument();
    if (!this.uploads) this.uploads = {};
    this.uploads[type] = {
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      loading: true,
      progress: 0,
      loadingText: 'Loading...',
    };
    const interval = setInterval(() => {
      const upload = this.uploads[type];
      if (!upload) return;

      if (upload.progress >= 100) {
        upload.progress = 100;
        upload.loadingText = 'Completed';
        clearInterval(interval);
      } else {
        upload.progress += 10;
        upload.loadingText = `${upload.progress}%`;
      }
    }, 60);

  }

  canDelete(deleteAllowedUntil: string | Date): boolean {
    return new Date(deleteAllowedUntil).getTime() > Date.now();
  }

  getDocumentTypeLookup() {
    const sub = this.lookupService
      .getSettingsLookup('DocumentType', { type: "Recruitment" })
      .subscribe({
        next: (res) => {
          this.selectDocumentType = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }


  saveDocument() {
    if (this.form.value.type && this.images.length > 0 && this.form.value.customerId) {
      const data = Object.assign({});
      data.customerId = this.form.value.customerId;
      data.file = this.images;
      data.type = this.getNameByValue(this.form.value.type, this.selectDocumentType);
      const sub = this.recruitmentService.saveDocument(data).subscribe({
        next: (res) => {
          this.getAllDocuments();
          this.form.get("type")?.reset();
          delete this.uploads["documents"];
          this.images = []
          sub.unsubscribe();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
    }

  }

  removeUpload(type: string, input?: HTMLInputElement) {
    if (this.uploads[type]) {
      delete this.uploads[type];
      if (input) input.value = '';
    }
  }

  getAllDocuments() {
    const sub = this.recruitmentService
      .getAllDocuments({ customer_id: this.form.value.customerId })
      .subscribe({
        next: (res) => {
          this.dataSource = res.data;
          this.documentIds = [];
          this.dataSource.forEach((x: any) => {
            this.documentIds.push(x._id)
          })
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  downloadFile(url: string, name: string) {
    this.fileSaverService.downloadFile(url, name);
  }

  viewDocument(url: string) {
    window.open(url, '_blank');
  }

  deleteDocument(id: string) {
    const isub = this.messageService
      .prompt(`Confirm Deletion`, 'Are you sure you want to delete this document?')
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.recruitmentService.deleteDocument(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllDocuments();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }

  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      data.startDate = changeDateToApiFormat(data?.startDate);
      if (data.isEndDate) {
        data.endDate = changeDateToApiFormat(data?.endDate);
      }
      data.documentIds = this.documentIds || [];
      if (this.id != '' && this.id != undefined) {
        const sub = this.recruitmentService
          .createOrUpdateRecruitment(data, this.id)
          .subscribe({
            next: (res) => {
              this.router.navigate(['recruitment/candidates/' + this.id]);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {
        const sub = this.recruitmentService.createOrUpdateRecruitment(data).subscribe({
          next: (res: any) => {
            this.router.navigate(['recruitment/candidates/' + res.data?.recruitmentId]);
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

  sendBackToParent() {
    this.sendToParent.emit('close');
  }

  ngOnDestroy(): void {
    this.routSub.unsubscribe();
  }
}
