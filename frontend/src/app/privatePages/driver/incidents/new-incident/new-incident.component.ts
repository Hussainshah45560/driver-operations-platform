import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../../core/import/import.module';
import { DatePickerComponent } from '../../../../core/date-picker/date-picker.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LbAutoCompleteComponent } from '../../../../core/lb-auto-complete/lb-auto-complete.component';
import { LookupService } from '../../../../_services/dataServices/lookup.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { DragComponent } from '../../../../core/drag/drag.component';
import { Checklist, Documents, lookupData } from '../../../../core/modals';
import { IncidentsService } from '../../../../_services/dataServices/incidents.service';
import { MessageService } from '../../../../_services/common/message.service';
import { FileSaverService } from '../../../../_services/common/fileSaver.service';
import { filter, Subscription, switchMap } from 'rxjs';
import { changeDateToApiFormat } from '../../../../core/utility';
import { AuthService } from '../../../../_services/common/auth.service';
import { BadgeColorService } from '../../../../_services/common/badgeColor.service';
import { PermissionService } from '../../../../_services/common/permission.service';

@Component({
  selector: 'app-new-incident',
  standalone: true,
  imports: [
    ImportModule,
    DatePickerComponent,
    LbAutoCompleteComponent,
    VMessageComponent,
    DragComponent,
  ],
  templateUrl: './new-incident.component.html',
  styleUrl: './new-incident.component.scss',
})
export class NewIncidentComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isView: boolean = false;
  selectIncidentType: lookupData[] = [];
  selectAssetType: lookupData[] = [];
  dataSource: Documents[] = [];
  vehicleCheckList!: Checklist[];
  assetId!: string;
  dynamicFields: { name: string, type: string }[] = [];
  oldDynamicFields: { name: string, type: string }[] = [];
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
  selectDocumentType!: lookupData[];
  selectStatus: lookupData[] = [{ name: 'Recovered', value: 'recovered' }, { name: 'Repaired', value: 'repaired' }, { name: 'Write-Off', value: 'write-off' }];
  params: Params = {};
  id!: string;
  routSub: Subscription;
  payload!: {};
  userId!: string;
  role: string;
  isEdit: boolean = false;
  formTemplateId!: string;
  formDate!: string;
  showButton: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private incidentsService: IncidentsService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private fileSaverService: FileSaverService,
    private authService: AuthService,
    private router: Router,
    private badgeColorService: BadgeColorService,
    public ps: PermissionService
  ) {
    this.role = this.authService.userDetails?.role?.name ?? '';
    this.form = this.formBuilder.group({
      date: ['', Validators.required],
      templateId: ['', Validators.required],
      assetId: ['', Validators.required],
      type: [''],
      status: [''],
      notes: ['']

    });
    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getSingleIncident();
      }
    });
    this.getIncidentTypeLookup();
    this.getDocumentTypeLookup();
    if (this.role != 'Admin') {
      this.userId = this.authService.userDetails?._id ?? '';
    }
    if (this.userId) {
      this.getAllDocuments();
      this.getAssetLookup();
    }

  }

  ngOnInit(): void {
    const url = this.router.url;
    this.isView = url.includes('view');
    if (this.isView) {
      this.form.disable();
    }
  }

  edit() {
    this.isEdit = true;
    this.showButton = true;
    this.form.get('status')?.enable();
    this.form.get('notes')?.enable();
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getSingleIncident() {
    const sub = this.incidentsService
      .getSingleIncident(this.id)
      .subscribe({
        next: (res) => {
          this.userId = res.data?.userId ?? '';
          if (this.userId) {
            this.getAllDocuments();
            this.getAssetLookup();
          }
          this.getDynamicFields(res.data?.templateId);
          this.formTemplateId = res.data?.templateId ?? '';
          this.formDate = res.data?.date ?? ''
          this.form.patchValue({
            date: res.data?.date ?? '',
            templateId: res.data?.templateId ?? '',
            assetId: res.data?.assetId ?? '',
            status: res.data?.status ?? '',
            notes: res.data?.notes ?? '',
          });
          this.payload = res.data?.payload;
          if (this.form.value.status != 'in review' && this.form.value.notes != null) {
            this.isEdit = true;
            this.form.get('status')?.disable();
            this.form.get('notes')?.disable();
          }

        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  patchDynamicFields(payload: any) {
    if (!payload) return;
    const patchData: any = {};
    this.dynamicFields.forEach(field => {
      if (payload.hasOwnProperty(field.name)) {
        patchData[field.name] = payload[field.name];
      }
    });

    this.form.patchValue(patchData);
    //   this.dynamicFields.forEach(field => {
    //   this.form.get(field.name)?.disable();
    // });
  }


  setBooleanValue(fieldName: string, value: boolean) {
    this.form.get(fieldName)?.setValue(value);
  }

  getDynamicFields(event: any) {
    const sub = this.incidentsService
      .getDynamicFields(event)
      .subscribe({
        next: (res) => {
          this.dynamicFields = [];
          this.dynamicFields = res.data;
          this.addDynamicFields(res.data);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  addDynamicFields(fields: any[]) {
    this.removeDynamicControls();
    fields.forEach(field => {
      let defaultValue = '';

      if (field.type === 'boolean') {
        defaultValue = field.default ?? false;
      }

      const validators = [Validators.required];
      // ✅ Add time validation if type is time
      if (field.type === 'time') {
        validators.push(
          Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        );
      }


      // Add the control
      this.form.addControl(
        field.name,
        this.formBuilder.control(
          defaultValue,
          validators
        )
      );

    });
    this.oldDynamicFields = fields;

    if (Object.keys(this.payload).length > 0) {
      this.patchDynamicFields(this.payload)
    }

  }

  removeDynamicControls() {
    if (!this.oldDynamicFields || this.oldDynamicFields.length === 0) return;

    this.oldDynamicFields.forEach(field => {
      if (this.form.contains(field.name)) {
        this.form.removeControl(field.name);
      }
    });

    console.log('Form controls after remove:', this.form.controls);
  }


  getDocumentTypeLookup() {
    const sub = this.lookupService
      .getSettingsLookup('DocumentType', { type: 'Incident' })
      .subscribe({
        next: (res) => {
          this.selectDocumentType = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getAssetLookup() {

    const sub = this.lookupService
      .getSettingsLookup('AssetDetail', { user_id: this.userId })
      .subscribe({
        next: (res) => {
          this.selectAssetType = res.data;
          this.assetId = res.data[0].value;
          this.form.patchValue({
            assetId: res.data[0].value ?? ''
          })
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getIncidentTypeLookup() {
    const sub = this.lookupService
      .getSettingsLookup('CmcTemplates', { used_for: 'incident_template' })
      .subscribe({
        next: (res) => {
          this.selectIncidentType = res.data;
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

  saveDocument() {
    if (this.form.value.type && this.images.length > 0 && this.userId) {
      const data = Object.assign({});
      data.userId = this.userId;
      data.file = this.images;
      data.type = this.getNameByValue(
        this.form.value.type,
        this.selectDocumentType,
      );
      const sub = this.incidentsService.saveDocument(data).subscribe({
        next: (res) => {
          this.getAllDocuments();
          this.form.get('type')?.reset();
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
    const params = Object.assign({});
    params.user_id = this.userId;
    params.type = 'Incident';
    if (this.id) {
      params.incident_id = this.id
    }
    const sub = this.incidentsService
      .getAllDocuments(params)
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
        'Are you sure you want to delete this document?',
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.incidentsService.deleteDocument(id);
        }),
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
      data.templateId = data.templateId ?? this.formTemplateId;
      data.date = changeDateToApiFormat(data.date) ?? this.formDate;
      data.assetId = this.assetId ?? '';
      data.userId = this.userId;
      const payload: any = {};
      this.dynamicFields.forEach(field => {
        payload[field.name] = this.form.value[field.name];
        delete data[field.name];
      });
      delete data.type;
      data.payload = payload;
      if (this.ps.havePerm('incidents', 'update')) {
        const sub = this.incidentsService.createOrUpdateincident(data, this.id).subscribe({
          next: (res) => {
            this.router.navigate(['incidents'])
            sub.unsubscribe();
          },
          error: (res) => {
            sub.unsubscribe();
          },
        });
      } else {
        const sub = this.incidentsService.createOrUpdateincident(data).subscribe({
          next: (res) => {
            this.router.navigate(['incidents'])
            sub.unsubscribe();
          },
          error: (res) => {
            sub.unsubscribe();
          },
        });
      }

    }
  }
  ngOnDestroy(): void {
    this.routSub.unsubscribe();
  }
}
