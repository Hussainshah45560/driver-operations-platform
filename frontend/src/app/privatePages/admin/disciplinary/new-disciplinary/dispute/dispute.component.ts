import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Pagination } from '../../../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ImportModule } from '../../../../../core/import/import.module';
import { Dispute, Documents, lookupData } from '../../../../../core/modals';
import { FileSaverService } from '../../../../../_services/common/fileSaver.service';
import { MessageService } from '../../../../../_services/common/message.service';
import { DisciplinaryService } from '../../../../../_services/dataServices/disciplinary.service';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { DragComponent } from '../../../../../core/drag/drag.component';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { CandidateStateService } from '../../../../../_services/common/candidate-state.service';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { DatePickerComponent } from '../../../../../core/date-picker/date-picker.component';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { changeDateToApiFormat } from '../../../../../core/utility';

@Component({
  selector: 'app-dispute',
  standalone: true,
  imports: [ImportModule, DragComponent, LbAutoCompleteComponent, DatePickerComponent, VMessageComponent],
  templateUrl: './dispute.component.html',
  styleUrl: './dispute.component.scss',
})
export class DisputeComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  pager: Pagination | any;
  qSub!: Subscription;
  disputeData!: Dispute;
  queryParams: Params = {};
  dataSource: Documents[] = [];
  images: any = [];
  selectDocumentType: lookupData[] = [];
  selectDisputeType: lookupData[] = [];
  selectOutcome: lookupData[] = [
    { name: 'Dismissed', value: 'dismissed' },
    { name: 'Not Guilty', value: 'not guilty' },
    { name: 'Final Warning', value: 'final warning' }
  ];
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
  applicationCategory!: string;
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
      type: [''],
      scheduledDate: [''],
      disputeTypeId: [''],
      disputeOutcome: [''],
      notes: ['']
    });
    this.getDisputeTypeLookup();
    this.getDocumentTypeLookup();
  }

  ngOnInit(): void {
    this.profileId = this.route.parent?.snapshot.queryParamMap.get('profileId') ?? '';
    this.candidateSub = this.candidateStateService.candidateData$.subscribe(data => {
      this.userId = data?.userId;
      this.applicationCategory = data?.applicationCategory ?? '';
      if (this.userId) {
        this.getAllDocuments();
        this.getDispute();
      }
      if (this.applicationCategory === 'contractor') {
        this.selectOutcome = this.selectOutcome.filter(
          o => o.value !== 'dismissed'
        );
        this.selectOutcome.push({
          name: 'Termination of Contract',
          value: 'termination of contract'
        });
      }
    });
  }

  getDispute() {
    const sub = this.disciplinaryService
      .getDispute(this.disciplinaryId, { type: "dispute" })
      .subscribe({
        next: (res) => {
          this.disputeData = res.data.dispute;
          this.form.patchValue({
            scheduledDate: this.disputeData?.scheduledDate ?? '',
            disputeTypeId: this.disputeData?.disputeTypeId ?? '',
            disputeOutcome: this.disputeData?.disputeOutcome ?? '',
            notes: this.disputeData?.notes ?? ''
          })
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getDisputeTypeLookup() {
    const sub = this.lookupService
      .getSettingsLookup('DisputeTypes')
      .subscribe({
        next: (res) => {
          this.selectDisputeType = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getDocumentTypeLookup() {
    const sub = this.lookupService
      .getSettingsLookup('DocumentType', { type: 'Dispute' })
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
      .getAllDocuments({ user_id: this.userId, type: 'Dispute', disciplinary_id: this.disciplinaryId })
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

  submit() {
    if (this.form.valid) {
      const data = Object.assign(this.form.value);
      data.scheduledDate = changeDateToApiFormat(this.form.value.scheduledDate);
      const sub = this.disciplinaryService
        .updateDispute(data, this.disciplinaryId)
        .subscribe({
          next: (res) => {
            this.router.navigate(
              ['/disciplinary', this.disciplinaryId, 'aod'], {
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
