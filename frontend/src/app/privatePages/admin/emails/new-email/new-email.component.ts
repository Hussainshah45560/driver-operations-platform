import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImportModule } from '../../../../core/import/import.module';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { TextEditorComponent } from '../../../../core/text-editor/text-editor.component';
import { EmailTemplate } from '../../../../core/modals';
import { EmailTemplateService } from '../../../../_services/dataServices/emailTemplate.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-new-email',
  standalone: true,
  imports: [ImportModule, VMessageComponent, TextEditorComponent],
  templateUrl: './new-email.component.html',
  styleUrl: './new-email.component.scss',
})
export class NewEmailComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  data!: EmailTemplate;
  emailTypeId!: string;
  params: Params = {};
  routSub: Subscription;
  qSub: Subscription;
  queryParams: Params = {};
  id!: string;
  usedFor!: string;
  templateFields!: { message: string, code: string }[];
  constructor(
    private formBuilder: FormBuilder,
    private emailtemplateService: EmailTemplateService,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToastrService
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      sendTo: [''],
      subject: ['', Validators.required],
      description: ['', [Validators.required]],
      content: ['', Validators.required],
      isActive: [false],
    });

    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getSingleEmailTemplate(this.id);
      }
    });

    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      if (this.queryParams['emailTypeId']) {
        this.emailTypeId = this.queryParams['emailTypeId'] ?? '';
        this.getTemplateFields();
      }
    });
  }
  ngOnInit(): void { }

  getSingleEmailTemplate(id: string) {
    const sub = this.emailtemplateService.getSingleEmailTemplate(id).subscribe({
      next: (res) => {
        this.data = res.data;
        this.form.patchValue({
          name: res.data.name ?? '',
          subject: res.data.subject ?? '',
          sendTo: res.data.sendTo ?? '',
          description: res.data.description ?? '',
          content: res.data.content ?? '',
          isActive: res.data.isActive ?? false,
        });
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  updateStatus(id: string) {
    const data = Object.assign({});
    data.emailTypeId = this.emailTypeId ?? '';
    const sub = this.emailtemplateService.updateStatus(id, data).subscribe({
      next: (res) => {
        this.getSingleEmailTemplate(this.id);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }


  getTemplateFields() {
    const sub = this.emailtemplateService
      .getTemplateFields(this.emailTypeId)
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

  submit() {
    if (this.form.valid) {
      const data = this.form.value;
      data.emailTypeId = this.emailTypeId;
      data.used_for = this.usedFor;
      let sendTo = data.sendTo ?? '';

      if (Array.isArray(sendTo)) {
        data.sendTo = sendTo;
      } else if (typeof sendTo === 'string') {
        data.sendTo = sendTo
          .split(',')
          .map((item: any) => item.trim())
          .filter((f: any) => f !== '');
      } else {
        data.sendTo = [];
      }
      if (this.id != '') {
        const sub = this.emailtemplateService
          .createOrUpdateEmailTemplate(data, this.id)
          .subscribe({
            next: (res) => {
              this.router.navigate(['emails']);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {
        const sub = this.emailtemplateService
          .createOrUpdateEmailTemplate(data)
          .subscribe({
            next: (res) => {
              this.router.navigate(['emails']);
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
