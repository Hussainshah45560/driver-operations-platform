import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../../core/import/import.module';
import {
  Checklist,
  Documents,
  DriverTesting,
  Induction,
  lookupData,
} from '../../../../../core/modals';
import { DatePickerComponent } from '../../../../../core/date-picker/date-picker.component';
import { filter, Subscription, switchMap } from 'rxjs';
import { InductionService } from '../../../../../_services/dataServices/induction.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { MessageService } from '../../../../../_services/common/message.service';
import { FileSaverService } from '../../../../../_services/common/fileSaver.service';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { DragComponent } from '../../../../../core/drag/drag.component';
import { CandidateStateService } from '../../../../../_services/common/candidate-state.service';
import { changeDateToApiFormat } from '../../../../../core/utility';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';

@Component({
  selector: 'app-driver-testing',
  standalone: true,
  imports: [ImportModule, DatePickerComponent, LbAutoCompleteComponent, DragComponent],
  templateUrl: './driver-testing.component.html',
  styleUrl: './driver-testing.component.scss',
})
export class DriverTestingComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  data!: DriverTesting;
  dataSource: Documents[] = [];
  driverCheckList!: Checklist[];
  driverTestingData!: Induction['driverTesting'];
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
  selectResult: lookupData[] = [{ name: 'Passed', value: 'passed' }, { name: 'Failed', value: 'failed' }];
  documentIds: string[] = [];
  customerId!: string;
  id!: string;
  userId!: string;
  params: Params = {};
  sub: Subscription | undefined;
  qSub: Subscription | undefined;
  inductionId!: string;
  checklistSelections: { [checklistId: string]: { [groupName: string]: string } } = {};
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private inductionService: InductionService,
    private messageService: MessageService,
    private fileSaverService: FileSaverService,
    private candidateStateService: CandidateStateService,
    private route: ActivatedRoute,
    public badgeColorService: BadgeColorService,
  ) {
    this.sub = this.route.parent?.params.subscribe(params => {
      this.params = params;
      this.id = params['applicationId'];
    });

    this.qSub = this.route.queryParams.subscribe(qParams => {
      this.inductionId = qParams['inductionId'];
    });

    this.form = this.formBuilder.group({
      checklist: ['']
    });

    this.form = this.formBuilder.group({
      isTestCompleted: [false],
      testDate: [''],
      testResult: [''],
      type: ['']
    });
    this.getDocumentTypeLookup();
  }

  ngOnInit(): void {
    this.candidateStateService.candidateData$.subscribe(data => {
      this.customerId = data?.customerId;
      this.userId = data?.userId;
      if (this.customerId) {
        this.getDriverCheckList(this.customerId);
      }
    });

  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getDriverTesting() {
    const sub = this.inductionService
      .getChecklistStep(this.inductionId)
      .subscribe({
        next: (res) => {
          this.driverTestingData = res.data?.driverTesting;
          this.form.patchValue({
            isTestCompleted: this.driverTestingData?.isTestCompleted ?? false,
            testDate: this.driverTestingData?.testDate ?? '',
            testResult: this.driverTestingData?.testResult ?? '',
          });
          this.customRequired(this.driverTestingData?.isTestCompleted ?? false, ['testDate', 'testResult']);
          this.patchSelectionsFromAPI(this.driverTestingData?.checklist)
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
    if (this.driverCheckList) {
      apiData.forEach((apiChecklist: any) => {
        const localChecklist = this.driverCheckList.find(item => item._id === apiChecklist.checklistId);
        if (!localChecklist) return;

        apiChecklist.group.forEach((apiGroup: any) => {
          const localGroup = localChecklist.groups.find(g => g.name === apiGroup.name);
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

  getDriverCheckList(id: string) {
    const sub = this.inductionService
      .getCustomerCheckList({ customer_id: id, type: 'driverCheck' })
      .subscribe({
        next: (res) => {
          this.driverCheckList = res.data?.checklists;
          if (this.inductionId) {
            this.getDriverTesting();
          }
          this.getAllDocuments();
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

  getNameByValue(value: string, arr: lookupData[]): string | undefined {
    const selectedArray = arr;
    const match = selectedArray.find((item) => item.value === value);
    return match ? match.name : undefined;
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

  saveDocument() {
    if (this.form.value.type && this.images.length > 0 && this.userId) {
      const data = Object.assign({});
      data.userId = this.userId;
      data.file = this.images;
      data.type = this.getNameByValue(this.form.value.type, this.selectDocumentType);
      const sub = this.inductionService.saveDocument(data).subscribe({
        next: (res) => {
          this.getAllDocuments();
          this.form.get("type")?.reset();
          delete this.uploads["document"];
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
    const sub = this.inductionService
      .getAllDocuments({ user_id: this.userId })
      .subscribe({
        next: (res) => {
          this.dataSource = res.data;
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
      .prompt(
        `Confirm Deletion`,
        'Are you sure you want to delete this document?'
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.inductionService.deleteDocument(id);
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

  goBack() {
    this.router.navigate(['induction']);
  }



  submit() {
    if (this.inductionId) {
      const payload = Object.entries(this.checklistSelections).map(([checklistId, groups]) => ({
        checklistId,
        group: Object.entries(groups).map(([name, status]) => ({ name, status }))
      }));

      const data = Object.assign({}, this.form.value);
      if (data.testDate) {
        data.testDate = changeDateToApiFormat(data.testDate);
      }
      data.checklist = payload;
      delete data.type;
      const sub = this.inductionService
        .updateDriverTesting(data, this.inductionId)
        .subscribe({
          next: (res: any) => {
            this.router.navigate(
              ['/induction', this.id, 'vehicle-testing'],
              {
                queryParams: { inductionId: this.inductionId }
              }
            );
            sub.unsubscribe();
          },
          error: (res) => {
            sub.unsubscribe();
          },
        });

    }
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.qSub?.unsubscribe();
  }
}
