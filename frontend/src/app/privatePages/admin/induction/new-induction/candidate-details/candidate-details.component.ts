import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ImportModule } from '../../../../../core/import/import.module';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { Documents, Induction, lookupData } from '../../../../../core/modals';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { filter, Subscription, switchMap } from 'rxjs';
import { DragComponent } from '../../../../../core/drag/drag.component';
import { MessageService } from '../../../../../_services/common/message.service';
import { FileSaverService } from '../../../../../_services/common/fileSaver.service';
import { InductionService } from '../../../../../_services/dataServices/induction.service';
import { CandidateStateService } from '../../../../../_services/common/candidate-state.service';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';

@Component({
  selector: 'app-candidate-details',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent, DragComponent],
  templateUrl: './candidate-details.component.html',
  styleUrl: './candidate-details.component.scss'
})
export class CandidateDetailsComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  stepData !: Induction;
  userId!: string;
  id!: string;
  queryParam: Params = {}
  params: Params = {};
  sub: Subscription | undefined;
  qSub: Subscription | undefined;
  dataSource: Documents[] = [];
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
  selectDocumentType: lookupData[] = [];
  images: any = [];
  candidateData: any;
  customerId!: string;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private inductionService: InductionService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private fileSaverService: FileSaverService,
    private candidateStateService: CandidateStateService,
    public badgeColorService: BadgeColorService,
  ) {
    this.form = this.formBuilder.group({
      applicationNumber: [''],
      status: [''],
      customer: [''],
      nickName: [''],
      firstName: [''],
      lastName: [''],
      nationality: [''],
      documentNumber: [''],
      email: ['', [Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      phoneNumber: [''],
      type: ['']
    });
    this.getDocumentTypeLookup();

    this.sub = this.route.parent?.params.subscribe(params => {
      this.params = params;
      this.id = params['applicationId'];
      if (this.id != null) {
        this.getInductionStep1();
      }
    });

    this.qSub = this.route.queryParams.subscribe(qParams => {
      this.queryParam = qParams;
    });

  }

  ngOnInit(): void {
    this.candidateStateService.candidateData$.subscribe(data => {
      this.userId = data?.userId;
      this.customerId = data?.customerId;

    });
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getInductionStep1() {
    const sub = this.inductionService
      .getInductionStep1({ application_id: this.id })
      .subscribe({
        next: (res) => {
          this.stepData = res.data;
          this.form.patchValue({
            applicationNumber: this.stepData?.applicationNumber ?? '',
            status: this.stepData?.status ?? '',
            customer: this.stepData?.customer ?? '',
            nickName: this.stepData?.userName ?? '',
            firstName: this.stepData?.firstName ?? '',
            lastName: this.stepData?.lastName ?? '',
            nationality: this.stepData?.nationality ?? '',
            documentNumber: this.stepData?.documentNumber ?? '',
            email: this.stepData?.email ?? '',
            phoneNumber: this.stepData?.phoneNumber ?? ''
          });
          if (this.userId) {
            this.getAllDocuments();
          }



        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }


  submit() {
    this.router.navigate([
      '/induction',
      this.id,
      'checklist'
    ]);

    this.router.navigate(
      ['/induction', this.id, 'checklist'],
      {
        queryParams: this.queryParam
      }
    );

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

  getDocumentTypeLookup() {
    const sub = this.lookupService
      .getSettingsLookup('DocumentType', { type: "Document" })
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
  canDelete(deleteAllowedUntil: string | Date): boolean {
    return new Date(deleteAllowedUntil).getTime() > Date.now();
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
      .prompt(`Confirm Deletion`, 'Are you sure you want to delete this document?')
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

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.qSub?.unsubscribe();
  }
}
