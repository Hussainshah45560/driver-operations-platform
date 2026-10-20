import { Component, OnDestroy, OnInit } from '@angular/core';
import { filter, switchMap } from 'rxjs';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InductionService } from '../../../../../_services/dataServices/induction.service';
import { MessageService } from '../../../../../_services/common/message.service';
import { FileSaverService } from '../../../../../_services/common/fileSaver.service';
import { ImportModule } from '../../../../../core/import/import.module';
import { DragComponent } from '../../../../../core/drag/drag.component';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { Documents, lookupData } from '../../../../../core/modals';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CandidateStateService } from '../../../../../_services/common/candidate-state.service';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { SignComponent } from '../../../../../core/sign/sign.component';
import { DatePickerComponent } from '../../../../../core/date-picker/date-picker.component';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../../../../_services/common/auth.service';
import { changeDateToApiFormat } from '../../../../../core/utility';

@Component({
  selector: 'app-contract',
  standalone: true,
  imports: [ImportModule, DragComponent, LbAutoCompleteComponent, SignComponent, DatePickerComponent],
  templateUrl: './contract.component.html',
  styleUrl: './contract.component.scss',
})
export class ContractComponent implements OnInit, OnDestroy {
  form!: FormGroup;
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
  images: any = [];
  contractFiles: any = [];
  selectDocumentType: lookupData[] = [];
  documentIds: string[] = [];
  userId!: string;
  customerId!: string;
  contractUrl: string = '';
  applicationId: string = '';
  contractName: string = '';
  showTemplate: boolean = false;
  isEdit: boolean = false;
  userSignUrl!: string;
  adminSignUrl!: string;
  hasAdminSigned: boolean = false;
  hasUserSigned: boolean = false;
  recruitmentId!: string;
  data: any;
  templateData: any;
  role!: string;
  contractId!: string;
  selectTemplates: lookupData[] = [];
  constructor(
    private lookupService: LookupService,
    private router: Router,
    private inductionService: InductionService,
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
    this.form = this.formBuilder.group({
      type: [''],
      adminSign: [''],
      adminSignDate: [new Date()],
      userSign: [''],
      userSignDate: [new Date()],
      templateId: ['']
    });

    this.getDocumentTypeLookup();
  }

  ngOnInit(): void {
    this.applicationId =
      this.route.parent?.snapshot.paramMap.get('applicationId') ?? '';
    this.candidateStateService.candidateData$.subscribe(data => {
      this.userId = data?.userId;
      this.customerId = data?.customerId;
      this.recruitmentId = data?.recruitmentId;
      if (this.userId) {
        this.getAllDocuments();
        this.getContract();
      }
      this.getTemplateLookup();
    });
  }


  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  showTemplateContent(bit: string) {
    this.showTemplate = true;
    if (bit == 'view') {
      this.isEdit = false;
    } else {
      this.isEdit = true;
    }

  }

  getContract() {
    const sub = this.inductionService
      .getContract({ user_id: this.userId })
      .subscribe({
        next: (res) => {
          this.data = res.data;
          this.templateData = this.sanitizer.bypassSecurityTrustHtml(this.data?.template || '');
          this.contractId = this.data._id ?? '';
          this.form.patchValue({
            templateId: this.data.templateId ?? ''
          })
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

  generateContract() {
    const sub = this.inductionService
      .generateContract({ application_id: this.applicationId, customer_id: this.customerId, recruitment_id: this.recruitmentId, contract_template_id: this.form.value.templateId })
      .subscribe({
        next: (res) => {
          this.data = res.data;
          this.templateData = this.sanitizer.bypassSecurityTrustHtml(this.data?.template || '');
          this.contractId = this.data?.contractId ?? '';
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
  getTemplateLookup() {
    const sub = this.lookupService
      .getSettingsLookup('CMCTEmplates', { used_for: 'contract_template', customer_id: this.customerId })
      .subscribe({
        next: (res) => {
          this.selectTemplates = res.data;
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
  selectImage(files: any, type: string, check?: boolean) {
    this.images = [];
    const file = check ? files.target.files[0] : files[0];
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
    if (type == 'contract') {
      this.contractFiles.push(file);
      this.uploadContract()
    } else {
      this.images.push(file);
      this.saveDocument();
    }
  }

  uploadContract() {
    const data = Object.assign({});
    data.file = this.contractFiles;
    data.type = 'Contract';
    data.userId = this.userId;
    const sub = this.inductionService
      .saveDocument(data)
      .subscribe({
        next: (res) => {
          this.getContract();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
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

  downloadContact() {
    const sub = this.inductionService.downloadContract(this.data?._id).subscribe({
      next: (res: any) => {
        window.open(res.data.url, '_blank');
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
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
    if (this.form.valid) {
      if ((this.data.signature?.adminSign != null && !['Driver'].includes(this.role)) || (this.data.signature?.userSign != null && ['Driver'].includes(this.role))) {
        this.router.navigate(['/induction']);
      } else {
        const data = Object.assign({}, this.form.value);
        data.adminSign = this.adminSignUrl;
        data.adminSignDate = changeDateToApiFormat(data?.adminSignDate);
        delete data.userSign;
        delete data.userSignDate

        if (this.contractId != '' && this.contractId != undefined) {
          const sub = this.inductionService
            .saveSignedTemplate(data, this.contractId)
            .subscribe({
              next: (res) => {
                this.router.navigate(['/induction']);
                sub.unsubscribe();
              },
              error: (res) => {
                sub.unsubscribe();
              },
            });
        }
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  ngOnDestroy(): void { }
}
