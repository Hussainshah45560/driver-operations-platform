import { Component, OnInit } from '@angular/core';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';
import { Documents, lookupData } from '../../../core/modals';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../core/import/import.module';
import { LbAutoCompleteComponent } from '../../../core/lb-auto-complete/lb-auto-complete.component';
import { ActivatedRoute, Router } from '@angular/router';
import { LookupService } from '../../../_services/dataServices/lookup.service';
import { DragComponent } from '../../../core/drag/drag.component';
import { AuthService } from '../../../_services/common/auth.service';
import { DocumentService } from '../../../_services/dataServices/document.service';
import moment from 'moment';
import { FileSaverService } from '../../../_services/common/fileSaver.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [ImportModule, LbAutoCompleteComponent, DragComponent],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
})
export class DocumentsComponent implements OnInit {
  form!: FormGroup;
  moment = moment;
  searchForm!: FormGroup;
  dataSource!: Documents[];
  isView: boolean = false;
  selectDocumentType: lookupData[] = [];
  userId!: string;
  images: any = [];
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

  constructor(
    public badgeColorService: BadgeColorService,
    private router: Router,
    private route: ActivatedRoute,
    private lookupService: LookupService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private documentService: DocumentService,
    private fileSaverService: FileSaverService
  ) {
    this.form = this.formBuilder.group({
      type: ['', [Validators.required]],
    });

    this.searchForm = this.formBuilder.group({
      searchTerm: [''],
    });
    this.userId = this.authService.userDetails?._id ?? '';

    this.getDocumentTypeLookup();
    this.getAllDocuments();
  }
  ngOnInit(): void { }

  search(searchTerm: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: searchTerm },
      queryParamsHandling: 'merge',
    });
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
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
    if (this.form.valid && this.images.length > 0) {
      const data = Object.assign({}, this.form.value);
      data.userId = this.userId;
      data.file = this.images;
      data.type = this.getNameByValue(data.type);
      const sub = this.documentService.saveDocument(data).subscribe({
        next: (res) => {
          this.getAllDocuments();
          this.form.reset();
          delete this.uploads['document'];
          this.images = [];
          sub.unsubscribe();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
    }
  }

  getNameByValue(value: string): string | undefined {
    const match = this.selectDocumentType.find((item) => item.value === value);
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

  viewDocument(url: string, type: string) {
    if (type == 'Selfie') {
      const newTab = window.open();
      newTab!.document.write('<img src="data:image/jpeg;base64,' + url + '" />');
    } else {
      window.open(url, '_blank');
    }
  }

  downloadFile(url: string, name: string) {
    this.fileSaverService.downloadFile(url, name);
  }

  printImage(url: string, type: string) {
    if (type == 'Selfie') {
      url = "data:image/jpeg;base64," + url
    }

    const width = 800;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const printWindow = window.open(
      '',
      '_blank',
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (!printWindow) return;

    // Detect file type
    let content = '';
    if (url.startsWith('data:image') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url)) {
      // Image (URL or base64)
      content = `<img src="${url}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`;
    } else if (url.startsWith('data:application/pdf') || /\.pdf$/i.test(url)) {
      // PDF (URL or base64)
       content = `
      <div style="
        width: 100%; 
        height: 100%; 
        display: flex; 
        justify-content: center; 
        align-items: center;
        overflow: hidden;
      ">
        <iframe src="${url}" style="
          width: 100%; 
          height: 100%; 
          border: none; 
          transform: scale(0.9); 
          transform-origin: top left;
        "></iframe>
      </div>
    `;
    } else {
      alert('Unsupported file type');
      return;
    }

    printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          html, body {
            margin: 0;
            height: 100%;
            text-align: center;
            overflow: hidden;
          }
          img {
            max-width: 100%;
            max-height: 100%;
          }
          iframe {
           display:block;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }




  getAllDocuments() {
    const sub = this.documentService
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

  removeUpload(type: string, input?: HTMLInputElement) {
    if (this.uploads[type]) {
      delete this.uploads[type];
      if (input) input.value = '';
    }
  }

  submit() {
    // if (this.documentIds.length > 0) {
    //   let data = Object.assign({});
    //   data.documentIds = this.documentIds;
    //   if (this.id) {
    //     const sub = this.applicationsService
    //       .createOrUpdateSteps(data, 'Step8', this.id)
    //       .subscribe({
    //         next: (res) => {
    //           this.router.navigate([
    //             '/applications/edit/' + this.id + '/step9',
    //           ]);
    //           sub.unsubscribe();
    //         },
    //         error: (res) => {
    //           sub.unsubscribe();
    //         },
    //       });
    //   }
    // } else {
    //   this.form.markAllAsTouched();
    // }
  }
}
