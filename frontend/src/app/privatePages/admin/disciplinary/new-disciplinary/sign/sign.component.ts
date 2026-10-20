import { Component, OnDestroy, OnInit } from '@angular/core';
import { Documents, lookupData } from '../../../../../core/modals';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DisciplinaryService } from '../../../../../_services/dataServices/disciplinary.service';
import { MessageService } from '../../../../../_services/common/message.service';
import { FileSaverService } from '../../../../../_services/common/fileSaver.service';
import { filter, Subscription, switchMap } from 'rxjs';
import { ImportModule } from '../../../../../core/import/import.module';
import { DragComponent } from '../../../../../core/drag/drag.component';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { CandidateStateService } from '../../../../../_services/common/candidate-state.service';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { DomSanitizer } from '@angular/platform-browser';
import { changeDateToApiFormat } from '../../../../../core/utility';
import { AuthService } from '../../../../../_services/common/auth.service';
import { DatePickerComponent } from '../../../../../core/date-picker/date-picker.component';
import { SignComponent } from '../../../../../core/sign/sign.component';
@Component({
  selector: 'app-signs',
  standalone: true,
  imports: [ImportModule, DragComponent, LbAutoCompleteComponent, VMessageComponent, SignComponent, DatePickerComponent],
  templateUrl: './sign.component.html',
  styleUrl: './sign.component.scss'
})
export class SignsComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  dataSource: Documents[] = [];
  templateName!: string;
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
  userId: string = '';
  disciplinaryId: string = '';
  contractUrl: string = '';
  profileId: string = '';
  selectDocumentType: lookupData[] = [];
  selectStatus: lookupData[] = [
    { name: 'Pending', value: 'pending' },
    { name: 'Viewed', value: 'viewed' },
    { name: 'Signed', value: 'signed' },
    { name: 'Closed', value: 'thursday' },
  ];
  documentIds: string[] = [];
  params: Params = {};
  candidateSub: Subscription | undefined;
  sub: Subscription | undefined;
  hasDisciplinaryEnquiry: boolean = false;
  showTemplate: boolean = false;
  isEdit: boolean = false;
  userSignUrl!: string;
  adminSignUrl!: string;
  hasAdminSigned: boolean = false;
  hasUserSigned: boolean = false;
  data: any;
  templateData: any;
  role!: string;
  contractId!: string;
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
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {
    this.role = this.authService.userDetails?.role?.name ?? '';
    this.sub = this.route.parent?.params.subscribe(params => {
      this.params = params;
      this.disciplinaryId = params['disciplinaryId'];
    });
    this.form = this.formBuilder.group({
      type: [''],
      // comments: [''],
      status: [''],
      userSignDate: [new Date()],
      userSign: [''],
      adminSignDate: [new Date()],
      adminSign: ['']

    });

    this.getDocumentTypeLookup();
  }

  ngOnInit(): void {
    this.profileId = this.route.parent?.snapshot.queryParamMap.get('profileId') ?? '';

    this.candidateSub = this.candidateStateService.candidateData$.subscribe(data => {
      this.userId = data?.userId;
      this.hasDisciplinaryEnquiry = data?.hasDisciplinaryEnquiry;
      if (this.userId) {
        this.getAllDocuments();
        this.getEnquiryTemplate();
      }
    });

  }
  showTemplateContent(bit: string) {
    this.showTemplate = true;
    if (bit == 'view') {
      this.isEdit = false;
    } else {
      this.isEdit = true;
    }

  }
  patchSign(event: any, type: string) {
    if (type == 'admin') {
      this.adminSignUrl = event;
      this.form.patchValue({
        adminSign: event
      });
    } else {
      this.userSignUrl = event;
      this.form.patchValue({
        userSign: event
      });
    }
  }

  getEnquiryTemplate() {
    const sub = this.disciplinaryService
      .getEnquiryTemplate({ disciplinary_id: this.disciplinaryId })
      .subscribe({
        next: (res) => {
          this.data = res.data;
          this.templateData = this.sanitizer.bypassSecurityTrustHtml(this.data?.template || '');
          this.contractId = this.data._id ?? '';
          this.hasAdminSigned =
            !!this.data?.signature?.adminSign &&
            !!this.data?.signature?.adminSignDate;
          this.hasUserSigned =
            !!this.data?.signature?.userSign &&
            !!this.data?.signature?.userSignDate;
          if (Object.keys(this.data?.signature).length > 0) {
            this.showTemplateContent('view');
            this.form.patchValue({
              adminSign: this.data?.signature?.adminSign ?? '',
              adminSignDate: this.data?.signature?.adminSignDate ?? '',
              userSign: this.data?.signature?.userSign ?? '',
              userSignDate: this.data?.signature?.userSignDate ?? '',
            })
          }
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getDocumentTypeLookup() {
    const sub = this.lookupService
      .getSettingsLookup('DocumentType', { type: 'Evidence' })
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


  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
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
      .getAllDocuments({ user_id: this.userId, type: 'Evidence', disciplinary_id: this.disciplinaryId })
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
  canDelete(deleteAllowedUntil: string | Date): boolean {
    return new Date(deleteAllowedUntil).getTime() > Date.now();
  }
  submit() {
    if (this.form.valid) {
      // || (this.data?.signature?.userSign != null)
      if ((this.data?.signature?.adminSign != null)) {
        if (this.hasDisciplinaryEnquiry || this.data?.templateName == 'Disciplinary Enquiry') {
          this.router.navigate(
            ['/disciplinary', this.disciplinaryId, 'hearing'], {
            queryParams: {
              profileId: this.profileId
            }
          },
          );
        } else {
          this.router.navigate(
            ['/disciplinary', this.disciplinaryId, 'dispute'], {
            queryParams: {
              profileId: this.profileId
            }
          },
          );
        }
      } else {
        const data = Object.assign({}, this.form.value);
        data.adminSign = this.adminSignUrl;
        data.adminSignDate = changeDateToApiFormat(data?.adminSignDate);
        delete data.userSign;
        delete data.userSignDate
        console.log(data, 'data')
        const sub = this.disciplinaryService
          .saveSignedTemplate(data, this.disciplinaryId)
          .subscribe({
            next: (res) => {
              if (this.hasDisciplinaryEnquiry || this.data?.templateName == 'Disciplinary Enquiry') {
                this.router.navigate(
                  ['/disciplinary', this.disciplinaryId, 'hearing'], {
                  queryParams: {
                    profileId: this.profileId
                  }
                },
                );
              } else {
                this.router.navigate(
                  ['/disciplinary', this.disciplinaryId, 'dispute'], {
                  queryParams: {
                    profileId: this.profileId
                  }
                },
                );
              }
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

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.candidateSub?.unsubscribe();
  }
}
