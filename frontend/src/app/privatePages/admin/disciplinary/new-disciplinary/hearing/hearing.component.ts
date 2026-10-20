import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../../../core/import/import.module';
import { DatePickerComponent } from '../../../../../core/date-picker/date-picker.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Documents, Hearing, lookupData } from '../../../../../core/modals';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DisciplinaryService } from '../../../../../_services/dataServices/disciplinary.service';
import { MessageService } from '../../../../../_services/common/message.service';
import { FileSaverService } from '../../../../../_services/common/fileSaver.service';
import { filter, Subscription, switchMap } from 'rxjs';
import { DragComponent } from '../../../../../core/drag/drag.component';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { CandidateStateService } from '../../../../../_services/common/candidate-state.service';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { changeDateToApiFormat } from '../../../../../core/utility';
import moment from 'moment';

@Component({
  selector: 'app-hearing',
  standalone: true,
  imports: [
    ImportModule,
    DatePickerComponent,
    LbAutoCompleteComponent,
    DragComponent,
    VMessageComponent
  ],
  templateUrl: './hearing.component.html',
  styleUrl: './hearing.component.scss',
})
export class HearingComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  hearingData!: Hearing;
  dataSource: Documents[] = [];
  selectLocation: lookupData[] = [];
  selectOutcome: lookupData[] = [
    { name: 'Dismissed', value: 'dismissed' },
    { name: 'Not Guilty', value: 'not guilty' },
    { name: 'Final Warning', value: 'final warning' }
  ];
  selectStatus: lookupData[] = [
    { name: 'Pending', value: 'pending' },
    { name: 'Viewed', value: 'viewed' },
    { name: 'Signed', value: 'signed' },
    { name: 'Closed', value: 'closed' },
  ];
  images: any = [];
  selectDocumentType: lookupData[] = [];
  documentIds: string[] = [];
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
  userId: string = '';
  disciplinaryId: string = '';
  profileId: string = '';
  params: Params = {};
  sub: Subscription | undefined;
  moment = moment;
  candidateSub: Subscription | undefined;
  constructor(
    private lookupService: LookupService,
    private router: Router,
    private disciplinaryService: DisciplinaryService,
    private messageService: MessageService,
    private fileSaverService: FileSaverService,
    private formBuilder: FormBuilder,
    private candidateStateService: CandidateStateService,
    public badgeColorService: BadgeColorService,
    private route: ActivatedRoute,
  ) {
    this.sub = this.route.parent?.params.subscribe(params => {
      this.params = params;
      this.disciplinaryId = params['disciplinaryId'];
    });
    this.form = this.formBuilder.group({
      scheduledDate: ['', Validators.required],
      isEmployeeAttended: [false],
      attendedDate: [''],
      dismissalDate: [''],
      location: ['', Validators.required],
      hearingOutcome: [''],
      status: [''],
      type: [''],
      isAodRequired: [false]
    });

    this.getDocumentTypeLookup();
  }
  ngOnInit(): void {
    this.profileId = this.route.parent?.snapshot.queryParamMap.get('profileId') ?? '';
    this.candidateSub = this.candidateStateService.candidateData$.subscribe(data => {
      this.userId = data?.userId;
      if (this.userId) {
        this.getAllDocuments();
        this.getHearing();
      }
    });
  }

  getHearing() {
    const sub = this.disciplinaryService
      .getHearing(this.disciplinaryId, { type: "hearing" })
      .subscribe({
        next: (res) => {
          this.hearingData = res.data.hearing;
          this.form.patchValue({
            scheduledDate: this.hearingData?.scheduledDate ?? '',
            isEmployeeAttended: this.hearingData?.isEmployeeAttended ?? false,
            attendedDate: this.hearingData?.attendedDate ?? '',
            dismissalDate: this.hearingData?.dismissalDate ?? '',
            location: this.hearingData?.location ?? '',
            hearingOutcome: this.hearingData?.hearingOutcome ?? '',
            status: this.hearingData?.status ?? '',
            type: this.hearingData?.type ?? '',
            isAodRequired: this.hearingData?.isAodRequired ?? false,
          })
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  setBooleanValue(field: string, value: boolean) {
    this.form.patchValue({ [field]: value });
  }

  getDocumentTypeLookup() {
    const sub = this.lookupService
      .getSettingsLookup('DocumentType', { type: 'Hearing' })
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
      data.disciplinaryId = this.disciplinaryId;
      data.file = this.images;
      data.type = this.getNameByValue(this.form.value.type, this.selectDocumentType);
      const sub = this.disciplinaryService.saveDocument(data).subscribe({
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
    const sub = this.disciplinaryService
      .getAllDocuments({ user_id: this.userId, type: 'Hearing', disciplinary_id: this.disciplinaryId })
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
          return this.disciplinaryService.deleteDocument(id);
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
    this.router.navigate(['disciplinary']);
  }

  sendNotice() {
    if (this.form.valid) {
      const data = Object.assign({});
      data.scheduledDate = changeDateToApiFormat(this.form.value.scheduledDate);
      data.location = this.form.value.location;
      const sub = this.disciplinaryService
        .sendNotice(data, this.disciplinaryId)
        .subscribe({
          next: (res) => {
            this.getHearing();
          },
          error: (res) => {
            sub.unsubscribe();
          },
        });
    }
  }

  checkOutcomeValue(event: any) {
    if (event == 'dismissed') {
      this.customRequired(true, ['dismissalDate'])
    } else {
      this.customRequired(false, ['dismissalDate'])
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

  submit() {
    if (this.form.valid) {
      const data = Object.assign(this.form.value);
      data.attendedDate = changeDateToApiFormat(data.attendedDate);
      if (data.dismissalDate != '') {
        data.dismissalDate = changeDateToApiFormat(data.dismissalDate);
      }
      const sub = this.disciplinaryService
        .updateHearing(data, this.disciplinaryId)
        .subscribe({
          next: (res) => {
            this.router.navigate(
              ['/disciplinary', this.disciplinaryId, 'dispute'], {
              queryParams: {
                profileId: this.profileId
              }
            },
            );
          },
          error: (res) => {
            sub.unsubscribe();
          },
        });
    }

  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.candidateSub?.unsubscribe();
  }
}
