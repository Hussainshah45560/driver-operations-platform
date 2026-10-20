import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../../../core/import/import.module';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApplicationsService } from '../../../../../_services/dataServices/applications.service';
import { filter, Subscription, switchMap } from 'rxjs';
import { Documents, lookupData } from '../../../../../core/modals';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { FileSaverService } from '../../../../../_services/common/fileSaver.service';
import { MessageService } from '../../../../../_services/common/message.service';
import { DragComponent } from '../../../../../core/drag/drag.component';
import { AuthService } from '../../../../../_services/common/auth.service';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { StatusCheckService } from '../../../../../_services/dataServices/statusCheck.service';

@Component({
  selector: 'app-step8',
  standalone: true,
  imports: [ImportModule, LbAutoCompleteComponent, DragComponent],
  templateUrl: './step8.component.html',
  styleUrl: './step8.component.scss',
})
export class Step8Component implements OnInit, OnDestroy {
  step8!: FormGroup;
  stepStatus!: string;
  isView: boolean = false;
  step8Changes: any;
  params: Params = {};
  sub: Subscription | undefined;
  selectDocumentType: lookupData[] = [];
  id!: string;
  userId!: string;
  images: any = [];
  dataSource: Documents[] = [];
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
  stepData: any;
  role!: string;
  approvalForm: FormGroup;
  documentList: string[] = [];
  remainingDocuments: string[] = [];
  rejected: boolean = false;
  disable: boolean = true;
  constructor(
    private formBuilder: FormBuilder,
    private applicationsService: ApplicationsService,
    private route: ActivatedRoute,
    private router: Router,
    private lookupService: LookupService,
    private fileSaverService: FileSaverService,
    private messageService: MessageService,
    private authService: AuthService,
    public badgeColorService: BadgeColorService,
    public statusCheckService: StatusCheckService,
  ) {
    this.step8 = this.formBuilder.group({
      type: ['', [Validators.required]],
    });
    this.approvalForm = this.formBuilder.group({
      reason: [''],
    });

    this.role = this.authService.userDetails?.role?.name ?? '';
    this.sub = this.route.parent?.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        console.log(this.id)
        this.getStepData();
      }
    });
    this.getDocumentTypeLookup();
  }
  ngOnInit(): void {
    const url = this.router.url;
    if (url.includes('view')) {
      this.isView = true;
      this.step8.disable();
    }
  }
  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  approveStep(status: string) {
    const data = Object.assign({});
    if (this.approvalForm.value.reason != '') {
      data.reason = this.approvalForm.value.reason;
    }
    data.status = status;
    const sub = this.applicationsService
      .approveStep(this.id, data, 'Step8', { step: 8 })
      .subscribe({
        next: (res) => {
          this.router.navigate(['/applications/view/' + this.id + '/step9']);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getRequiredDocuments() {
    const sub = this.applicationsService
      .getRequiredDocuments({ user_id: this.userId })
      .subscribe({
        next: (res) => {
          this.documentList = res.data;
          this.getAllDocumentsByApplicationId();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getStepData() {
    const sub = this.applicationsService.getStepData('8', this.id).subscribe({
      next: (res) => {
        this.stepData = res.data;
        if (
          !this.statusCheckService.isStepValid(
            'editable',
            this.stepData?.stepStatus?.step8,
            this.stepData?.applicationStatus,
          )
        ) {
          this.router.navigate(['/applications/view/' + this.id + '/step8']);
        }
        // this.stepStatus = res.data.stepStatus.step6;
        this.userId = this.stepData.userId;
        if (this.userId != null) {
          this.getRequiredDocuments();
        }
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  goBack() {
    this.router.navigate([
      '/applications/' + (this.isView ? 'view/' : 'edit/') + this.id + '/step7',
    ]);
  }

  viewDocument(url: string, type: string) {
    if (type == 'Selfie') {
      const newTab = window.open();
      newTab!.document.write(
        '<img src="data:image/jpeg;base64,' + url + '" />',
      );
    } else {
      window.open(url, '_blank');
    }
  }

  // getAllDocumentsByApplicationId() {
  //   const sub = this.applicationsService
  //     .getAllDocumentsByApplicationId({ user_id: this.userId })
  //     .subscribe({
  //       next: (res) => {
  //         this.dataSource = res.data;
  //         this.documentIds = [];
  //         this.dataSource.forEach((x: any) => {
  //           this.documentIds.push(x._id)
  //         });
  //         const allExist = this.documentList.every(type =>
  //           this.dataSource.some(obj => obj.type === type)
  //         );

  //         if (allExist) {
  //           this.disable = false;
  //         } else {
  //           this.disable = true;
  //         }
  //       },
  //       error: (res) => {
  //         sub.unsubscribe();
  //       },
  //     });
  // }

  getAllDocumentsByApplicationId() {
    const sub = this.applicationsService
      .getAllDocumentsByApplicationId({ user_id: this.userId })
      .subscribe({
        next: (res) => {
          this.dataSource = res.data;
          this.documentIds = [];

          this.dataSource.forEach((x: any) => {
            this.documentIds.push(x._id);
          });

          this.remainingDocuments = this.documentList.filter(
            (type) => !this.dataSource.some((doc) => doc.type === type),
          );
          this.disable = this.remainingDocuments.length !== 0;
        },
        error: () => {
          sub.unsubscribe();
        },
      });
  }

  canDelete(deleteAllowedUntil: string | Date): boolean {
    return new Date(deleteAllowedUntil).getTime() > Date.now();
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

  saveDocument() {
    if (this.step8.valid && this.images.length > 0) {
      const data = Object.assign({}, this.step8.value);
      data.userId = this.userId;
      // data.applicationId = this.id;
      data.file = this.images;
      data.type = this.getNameByValue(data.type);
      const sub = this.applicationsService.saveDocument(data).subscribe({
        next: (res) => {
          this.getAllDocumentsByApplicationId();
          this.step8.reset();
          delete this.uploads['document'];
          this.images = [];
          sub.unsubscribe();
        },
        error: (res) => {
          this.step8.reset();
          delete this.uploads['document'];
          this.images = [];
          sub.unsubscribe();
        },
      });
    }
  }

  getNameByValue(value: string): string | undefined {
    const match = this.selectDocumentType.find((item) => item.value === value);
    return match ? match.name : undefined;
  }

  submit() {
    if (this.documentIds.length > 0) {
      let data = Object.assign({});
      data.documentIds = this.documentIds;
      if (this.id) {
        const sub = this.applicationsService
          .createOrUpdateSteps(data, 'Step8', this.id)
          .subscribe({
            next: (res) => {
              this.router.navigate([
                '/applications/edit/' + this.id + '/step9',
              ]);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      }
    } else {
      this.step8.markAllAsTouched();
    }
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

  removeUpload(type: string, input?: HTMLInputElement) {
    if (this.uploads[type]) {
      delete this.uploads[type];
      if (input) input.value = '';
    }
  }

  downloadFile(url: string, name: string) {
    this.fileSaverService.downloadFile(url, name);
  }

  // deleteDocument(id: string) {
  //   const isub = this.messageService
  //     .prompt(
  //       `Confirm Deletion`,
  //       'Are you sure you want to delete this document?',
  //     )
  //     .afterClosed()
  //     .pipe(
  //       filter((_confirmed: boolean) => _confirmed),
  //       switchMap(() => {
  //         return this.applicationsService.deleteDocument(id);
  //       }),
  //     )
  //     .subscribe({
  //       next: (res) => {
  //         this.getAllDocumentsByApplicationId();
  //         isub.unsubscribe();
  //       },
  //       error: (res) => {
  //         isub.unsubscribe();
  //       },
  //     });
  // }

  deleteDocument(id: string) {
    const isub = this.messageService
      .prompt(
        `Confirm Deletion`,
        'Are you sure you want to delete this document?',
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => this.applicationsService.deleteDocument(id)),
      )
      .subscribe({
        next: (res) => {
          this.dataSource = this.dataSource.filter((doc) => doc._id !== id);
          this.documentIds = this.dataSource.map((doc) => doc._id);

          this.remainingDocuments = this.documentList.filter(
            (type) => !this.dataSource.some((doc) => doc.type === type),
          );

          this.disable = this.remainingDocuments.length !== 0;

          isub.unsubscribe();
        },
        error: (err) => {
          // console.error('Delete failed', err);
          isub.unsubscribe();
        },
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
