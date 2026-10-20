import { Component, Inject, OnInit, Optional } from '@angular/core';
import { ImportModule } from '../../../../core/import/import.module';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { DatePickerComponent } from '../../../../core/date-picker/date-picker.component';
import { RecruitmentsService } from '../../../../_services/dataServices/recruitments.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LookupService } from '../../../../_services/dataServices/lookup.service';
import { lookupData } from '../../../../core/modals';
import { DomSanitizer } from '@angular/platform-browser';
import { LbAutoCompleteComponent } from '../../../../core/lb-auto-complete/lb-auto-complete.component';
import { changeDateToApiFormat } from '../../../../core/utility';
import { CandidateStateService } from '../../../../_services/common/candidate-state.service';
import { SignComponent } from '../../../../core/sign/sign.component';

@Component({
  selector: 'app-generate-contract',
  standalone: true,
  imports: [ImportModule, VMessageComponent, DatePickerComponent, LbAutoCompleteComponent, SignComponent],
  templateUrl: './generate-contract.component.html',
  styleUrl: './generate-contract.component.scss'
})
export class GenerateContractComponent implements OnInit {
  form: FormGroup;
  selectTemplates: lookupData[] = [];
  userId!: string;
  customerId!: string;
  contractUrl: string = '';
  applicationId: string = '';
  contractName: string = '';
  showTemplate: boolean = false;
  userSignUrl!: string;
  adminSignUrl!: string;
  hasAdminSigned: boolean = false;
  hasUserSigned: boolean = false;
  isEdit: boolean = false;
  recruitmentId!: string;
  contractId!: string;
  templateData: any;
  data: any;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<GenerateContractComponent>,
    private lookupService: LookupService,
    private recruitmentService: RecruitmentsService,
    private sanitizer: DomSanitizer,
    private candidateStateService: CandidateStateService,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) {
    this.form = this.formBuilder.group({
      adminSign: [''],
      adminSignDate: [new Date()],
      userSign: [''],
      userSignDate: [new Date()],
      templateId: ['']
    });
    this.applicationId = this.dialogData.id ?? '';
    this.recruitmentId = this.dialogData?.recruitmentId ?? '';
    this.userId = this.dialogData?.userId ?? '';
    if (this.userId) {
      this.getContract();
    }
  }

  ngOnInit(): void {
    this.candidateStateService.candidateData$.subscribe(data => {

      this.customerId = data?.customerId;
      this.getTemplateLookup();
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

  getContract() {
    const sub = this.recruitmentService
      .getContract({ user_id: this.userId })
      .subscribe({
        next: (res) => {
          this.data = res.data;
          this.templateData = this.sanitizer.bypassSecurityTrustHtml(this.data?.template || '');
          this.contractId = this.data._id ?? '';
          this.form.patchValue({
            templateId: this.data?.templateId ?? ''
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

  generateContract() {
    const sub = this.recruitmentService
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

   downloadContact() {
    const sub = this.recruitmentService.downloadContract(this.data?._id).subscribe({
      next: (res: any) => {
        window.open(res.data.url, '_blank');
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  submit() {
    if (this.form.valid) {
      if (this.data.signature?.adminSign != null) {
        this.close();
      }
      else {
        const data = Object.assign({}, this.form.value);
        data.adminSign = this.adminSignUrl;
        data.adminSignDate = changeDateToApiFormat(data?.adminSignDate);
        delete data.userSign;
        delete data.userSignDate

        if (this.contractId != '' && this.contractId != undefined) {
          const sub = this.recruitmentService
            .saveSignedTemplate(data, this.contractId)
            .subscribe({
              next: (res) => {
                this.close();
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
  close() {
    this.dialogRef.close();
  }
}
