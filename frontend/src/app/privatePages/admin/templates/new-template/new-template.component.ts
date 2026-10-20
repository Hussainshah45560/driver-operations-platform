import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CmcTemplate, lookupData } from '../../../../core/modals';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TemplateService } from '../../../../_services/dataServices/template.service';
import { ImportModule } from '../../../../core/import/import.module';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { TextEditorComponent } from '../../../../core/text-editor/text-editor.component';
import { LookupService } from '../../../../_services/dataServices/lookup.service';
import { LbAutoCompleteComponent } from '../../../../core/lb-auto-complete/lb-auto-complete.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-new-template',
  standalone: true,
  imports: [
    ImportModule,
    VMessageComponent,
    TextEditorComponent,
    LbAutoCompleteComponent,
  ],
  templateUrl: './new-template.component.html',
  styleUrl: './new-template.component.scss',
})
export class NewTemplateComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  data!: CmcTemplate;
  emailTypeId!: string;
  templateTypeId!: string;
  params: Params = {};
  routSub: Subscription;
  id!: string;
  selectDocumentType: lookupData[] = [];
  selectTemplateType: lookupData[] = [];
  selectTemplateFields: lookupData[] = [
    { name: "Location", value: "location" },
    { name: "Time", value: "time" },
    { name: "Description", value: "description" },
    { name: "Condition", value: "condition" },
    { name: "Object", value: "object" },
    { name: "Damage", value: "damage" },
    { name: "Vehicle", value: "vehicle" },
    { name: "Fled", value: "fled" }
  ];
  selectCustomer: lookupData[] = [];
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
  qSub: Subscription;
  queryParams: Params = {};
  usedFor!: string;
  images: any = [];
  templateFields!: { for: string, variableFor: string }[];
  showFieldsDropDown: boolean = false;
  showSignFields: boolean = false;
  selectedFields: any[] = [];
  platForms: lookupData[] = [{ name: 'SignNow', value: 'signNow' }]
  constructor(
    private formBuilder: FormBuilder,
    private templateService: TemplateService,
    private route: ActivatedRoute,
    private router: Router,
    private lookupService: LookupService,
    private toaster: ToastrService
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      documentName: [''],
      customerId: [''],
      documentTypeId: [''],
      description: ['', [Validators.required]],
      content: ['', Validators.required],
      isActive: [false],
      templateFields: [''],
      signPlatform: ['']
    });

    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getSingleTemplate(this.id);
      }
    });
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      if (this.queryParams['templateTypeId']) {
        this.templateTypeId = this.queryParams['templateTypeId'] ?? '';
        this.getTemplateFields();
      }
    });
    if (this.templateTypeId == '691f5c51123d03c8fc06962e') {
      this.showFieldsDropDown = true;
      const otherField = this.form.get('templateFields');
      otherField?.setValidators([Validators.required]);
      otherField?.updateValueAndValidity();
    }
    if (this.templateTypeId == '691f5c51123d03c8fc06962c') {
      this.showSignFields = true;
    }
    this.getDocumentTypeLookup();
    this.getCustomerLookup();
  }
  ngOnInit(): void { }
  getSingleTemplate(id: string) {
    const sub = this.templateService.getSingleTemplate(id).subscribe({
      next: (res) => {
        this.data = res.data;
        this.form.patchValue({
          documentName: res.data?.documentName ?? '',
          documentTypeId: res.data?.documentTypeId ?? '',
          name: res.data.name ?? '',
          description: res.data.description ?? '',
          content: res.data.content ?? '',
          isActive: res.data.isActive ?? false,
          signPlatform: res.data.signPlatform ?? '',
          customerId: res.data.customerId ?? '',
          templateFields: (res.data?.fields ?? [])
            .map(f => f.name)
        });
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }



  updateStatus(id: string) {
    const sub = this.templateService.updateStatus(id).subscribe({
      next: (res) => {
        this.getSingleTemplate(this.id);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getCustomerLookup() {
    const sub = this.lookupService
      .getSettingsLookup('Customers')
      .subscribe({
        next: (res) => {
          this.selectCustomer = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
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

  getTemplateFields() {
    const sub = this.templateService
      .getTemplateFields(this.templateTypeId)
      .subscribe({
        next: (res) => {
          this.templateFields = res.data?.fields;
          this.usedFor = res.data?.used_for ?? '';
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  copyClipboard(text: string) {
    navigator.clipboard.writeText(text)
      .then(() => {
        this.toaster.success('Copied to clipboard successfully!', 'Success');
      })
      .catch(() => {
        this.toaster.error('Failed to copy text. Please try again.', 'Error');
      });
  }


  selectImage(event: any, type: string) {
    this.images = [];
    const file = event.target.files[0];
    this.images.push(file);
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

  pushSelectedField(selectedValues: string[]) {
    const fieldTypes = [
      { name: "time", type: "time" },
      { name: "vehicle", type: "string" },
      { name: "fled", type: "boolean" },
      { name: "damage", type: "text" },
      { name: "object", type: "string" },
      { name: "condition", type: "text" },
      { name: "description", type: "text" },
      { name: "location", type: "string" }
    ];

    // Add new selections
    selectedValues.forEach(value => {
      const field = fieldTypes.find(f => f.name === value);
      if (field && !this.selectedFields.some(f => f.name === field.name)) {
        this.selectedFields.push(field);
      }
    });

    // Remove unselected fields
    this.selectedFields = this.selectedFields.filter(f =>
      selectedValues.includes(f.name)
    );
  }


  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      data.templateTypeId = this.templateTypeId;
      data.used_for = this.usedFor;
      if (data.documentTypeId == '') {
        delete data.documentTypeId
      }
      if (this.templateTypeId == '691f5c51123d03c8fc06962e') {
        data.fields = this.selectedFields ?? [];
        delete data.templateFields
      }
      if (this.id != '') {
        const sub = this.templateService
          .createOrUpdateTemplate(data, this.id)
          .subscribe({
            next: (res) => {
              this.router.navigate(['templates']);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {
        const sub = this.templateService
          .createOrUpdateTemplate(data)
          .subscribe({
            next: (res) => {
              this.router.navigate(['templates']);
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
    this.routSub.unsubscribe();
    this.qSub.unsubscribe();
  }
}
