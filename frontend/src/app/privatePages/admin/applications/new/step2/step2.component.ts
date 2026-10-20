import { Component, OnDestroy, OnInit } from '@angular/core';
import { LbAutoCompleteComponent } from '../../../../../core/lb-auto-complete/lb-auto-complete.component';
import { VMessageComponent } from '../../../../../core/v-message/v-message.component';
import { ImportModule } from '../../../../../core/import/import.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupService } from '../../../../../_services/dataServices/lookup.service';
import { lookupData } from '../../../../../core/modals';
import { ApplicationsService } from '../../../../../_services/dataServices/applications.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BadgeColorService } from '../../../../../_services/common/badgeColor.service';
import { AuthService } from '../../../../../_services/common/auth.service';
import { StatusCheckService } from '../../../../../_services/dataServices/statusCheck.service';
import { ScrollService } from '../../../../../_services/common/scroll.service';

@Component({
  selector: 'app-step2',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent],
  templateUrl: './step2.component.html',
  styleUrl: './step2.component.scss',
})
export class Step2Component implements OnInit, OnDestroy {
  step2!: FormGroup;
  dependantForm!: FormGroup;
  selectRegion: lookupData[] = [];
  selectRelation: lookupData[] = [];
  params: Params = {};
  sub: Subscription | undefined;
  id!: string;
  editingId!: string | null;
  savedDependants: any[] = [];
  addNewDepedndant: boolean = false;
  create: boolean = true;
  userId!: string;
  stepStatus!: string;
  isView: boolean = false;
  step2Changes: any;
  selectSpouseRelation: lookupData[] = [];
  stepData: any;
  role!: string;
  approvalForm: FormGroup;
  rejected: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private appilcationService: ApplicationsService,
    private route: ActivatedRoute,
    private router: Router,
    private badgeColorService: BadgeColorService,
    private authService: AuthService,
    public statusCheckService: StatusCheckService,
    private scrollService: ScrollService
  ) {
    this.step2 = this.formBuilder.group({
      _id: [''],
      kin_id: [''],
      isMarried: [false],
      sameAsMine: [false],
      sameAsSpouse: [false],
      sameAsMineForKin: [false],
      firstName: [''],
      lastName: [''],
      mobilePhone: ['', [Validators.pattern(/^\+?[0-9]\d{9,14}$/)]],
      homePhone: ['', [Validators.pattern(/^\+?[0-9]\d{9,14}$/)]],
      relationId: [''],
      line1: [''],
      line2: [''],
      suburb: [''],
      regionId: [''],
      zipCode: [''],
      kinsfirstName: ['', Validators.required],
      kinslastName: ['', Validators.required],
      kinsmobilePhone: [
        '',
        [Validators.pattern(/^\+?[0-9]\d{9,14}$/), Validators.required],
      ],
      kinshomePhone: ['', [Validators.pattern(/^\+?[0-9]\d{9,14}$/)]],
      kinsline1: ['', Validators.required],
      kinsline2: [''],
      kinssuburb: ['', Validators.required],
      kinsregionId: ['', Validators.required],
      kinszipCode: ['', Validators.required],
      kinsrelationId: ['', Validators.required],
    });

    this.dependantForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: ['', Validators.required],
    });

    this.approvalForm = this.formBuilder.group({
      reason: ['']
    });
    this.role = this.authService.userDetails?.role?.name ?? '';
    this.sub = this.route.parent?.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getStepData();
      }
    });

    this.getRegionLookup();
    this.getRelationLookup();
    this.getRelationForSpouseLookup();
  }
  ngOnInit(): void {
    const url = this.router.url;
    if (url.includes('view')) {
      this.isView = true;
      this.step2.disable();
    }
  }
  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }
  getStepData() {
    const sub = this.appilcationService
      .getStepData('2', this.id)
      .subscribe({
        next: (res) => {
          if (res.data.emergencyContacts && res.data.emergencyContacts.length > 0) {
            this.create = false;
          }
          this.userId = res.data?.userId;
          this.stepData = res.data;
          if (!this.statusCheckService.isStepValid('editable', this.stepData?.stepStatus?.step2, this.stepData?.applicationStatus)
          ) {
            this.router.navigate(['/applications/view/' + this.id + '/step2']);
          }
          if (this.stepData.stepStatus.step2 == 'changed') {
            this.step2.disable();
          }
          if (this.stepData && this.stepData?.step2Changes) {
            this.step2Changes = this.stepData?.step2Changes;
          }
          this.savedDependants = this.stepData.dependents;
          this.patchFieldByReltion(this.stepData);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  sameAsMin(value: string, form: string) {
    if (value == 'mine') {
      if (this.step2.value[form] == true) {
        this.step2.patchValue({
          line1: this.stepData?.physicalAddress?.line1,
          line2: this.stepData?.physicalAddress?.line2,
          suburb: this.stepData?.physicalAddress?.suburb,
          regionId: this.stepData?.physicalAddress?.regionId,
          zipCode: this.stepData?.physicalAddress?.zipCode,
        });
      } else {
        this.step2.patchValue({
          line1: '',
          line2: '',
          suburb: '',
          regionId: '',
          zipCode: '',
        });
      }
    } else if (value == 'spouse') {
      if (this.step2.value[form]) {
        this.step2.patchValue({
          kinsfirstName: this.step2.value.firstName,
          kinslastName: this.step2.value.lastName,
          kinsmobilePhone: this.step2.value.mobilePhone,
          kinshomePhone: this.step2.value.homePhone,
        });
      } else {
        this.step2.patchValue({
          kinsfirstName: '',
          kinslastName: '',
          kinsmobilePhone: '',
          kinshomePhone: '',
        });
      }
    } else {
      if (this.step2.value[form]) {
        this.step2.patchValue({
          kinsline1: this.stepData?.physicalAddress?.line1,
          kinsline2: this.stepData?.physicalAddress?.line2,
          kinssuburb: this.stepData?.physicalAddress?.suburb,
          kinsregionId: this.stepData?.physicalAddress?.regionId,
          kinszipCode: this.stepData?.physicalAddress?.zipCode,
        });
      } else {
        this.step2.patchValue({
          kinsline1: '',
          kinsline2: '',
          kinssuburb: '',
          kinsregionId: '',
          kinszipCode: '',
        });
      }
    }
  }
  goBack() {
    this.router.navigate([
      '/applications/' + (this.isView ? 'view/' : 'edit/') + this.id + '/step1',
    ]);
  }
  patchFieldByReltion(stepData: any) {
    this.step2.patchValue({
      isMarried: stepData.isMarried ?? false,
    });
    if (stepData.emergencyContacts && stepData.emergencyContacts.length > 0) {
      stepData.emergencyContacts.forEach((c: any) => {
        if (c.type == 'spouse') {
          this.step2.patchValue({
            sameAsMine: c?.address?.sameAsMine,
            firstName: c?.firstName ?? '',
            lastName: c?.lastName ?? '',
            mobilePhone: c?.mobilePhone ?? '',
            homePhone: c?.homePhone ?? '',
            relationId: c?.relationId ?? '',
            line1: c?.address?.line1 ?? '',
            line2: c?.address?.line2 ?? '',
            suburb: c?.address?.suburb ?? '',
            zipCode: c?.address?.zipCode ?? '',
            regionId: c?.address?.regionId ?? '',
            _id: c._id ?? '',
          });
        } else {
          this.step2.patchValue({
            sameAsSpouse: c?.address?.sameAsSpouse,
            sameAsMineForKin: c?.address?.sameAsMineForKin,
            kinsfirstName: c?.firstName ?? '',
            kinslastName: c?.lastName ?? '',
            kinsmobilePhone: c?.mobilePhone ?? '',
            kinshomePhone: c?.homePhone ?? '',
            kinsline1: c?.address?.line1 ?? '',
            kinsline2: c?.address?.line2 ?? '',
            kinssuburb: c?.address?.suburb ?? '',
            kinszipCode: c?.address?.zipCode ?? '',
            kinsregionId: c?.address?.regionId ?? '',
            kinsrelationId: c?.relationId ?? '',
            kin_id: c._id ?? '',
          });
        }
      });
    }
  }

  addDependant() {
    this.addNewDepedndant = true;
  }
  cancel() {
    this.addNewDepedndant = false;
  }

  saveAndUpdateDependant() {
    this.savedDependants = this.savedDependants || [];
    if (this.dependantForm.valid) {
      const data = this.dependantForm.value;

      if (this.editingId) {
        const index = this.savedDependants.findIndex(
          (d) => d._id === this.editingId
        );
        if (index !== -1) {
          this.savedDependants[index] = {
            ...this.savedDependants[index],
            ...data,
            _id: this.editingId,
          };
        }
        this.editingId = null;
      } else {
        const newId = this.generateHexId();
        this.savedDependants.push({ ...data, _id: newId });
      }

      this.dependantForm.reset();
      this.addNewDepedndant = false;
    }
  }
  generateHexId(): string {
    const chars = 'abcdef0123456789';
    let id = '';
    for (let i = 0; i < 24; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }

  removeSavedDependant(id: string) {
    const index = this.savedDependants.findIndex((x) => x.id === id);
    if (index !== -1) this.savedDependants.splice(index, 1);
  }

  editSavedDependant(id: string) {
    this.addNewDepedndant = true;
    const dependant = this.savedDependants.find((d) => d._id === id);
    if (dependant) {
      this.editingId = id;
      this.dependantForm.patchValue(dependant);
    }
  }

  getRegionLookup() {
    const sub = this.lookupService.getSettingsLookup('Regions').subscribe({
      next: (res) => {
        this.selectRegion = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getRelationLookup() {
    const sub = this.lookupService
      .getSettingsLookup('RelationType', { category: 'Kin' })
      .subscribe({
        next: (res) => {
          this.selectRelation = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getRelationForSpouseLookup() {
    const sub = this.lookupService
      .getSettingsLookup('RelationType', { category: 'Spouse' })
      .subscribe({
        next: (res) => {
          this.selectSpouseRelation = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  setBooleanValue(field: 'isMarried', value: boolean) {
    this.step2.patchValue({ [field]: value });
  }

  submit() {
    if (this.step2.valid) {
      let data = Object.assign({}, this.step2.value);
      data.contacts = [];
      if (data.isMarried) {
        data.contacts.push({
          firstName: data.firstName,
          lastName: data.lastName,
          homePhone: data.homePhone,
          relationId: data.relationId,
          mobilePhone: data.mobilePhone,
          type: 'spouse',
          _id: data?._id,
          address: {
            sameAsMine: data.sameAsMine,
            line1: data.line1,
            line2: data.line2,
            suburb: data.suburb,
            regionId: data.regionId,
            zipCode: data.zipCode,
          },
        });
      }
      data.contacts.push({
        firstName: data.kinsfirstName,
        lastName: data.kinslastName,
        homePhone: data.kinshomePhone,
        mobilePhone: data.kinsmobilePhone,
        relationId: data.kinsrelationId,
        _id: data?.kin_id,
        type: 'kin',
        address: {
          sameAsMineForKin: data.sameAsMineForKin,
          sameAsSpouse: data.sameAsSpouse,
          line1: data.kinsline1,
          line2: data.kinsline2,
          suburb: data.kinssuburb,
          regionId: data.kinsregionId,
          zipCode: data.kinszipCode,
        },
      });
      data.dependents = this.savedDependants || [];
      data.userId = this.userId;
      data.create = this.create;

      const keysToRemove = [
        'firstName',
        'lastName',
        'sameAsMineForKin',
        'sameAsSpouse',
        'sameAsMine',
        'mobilePhone',
        'homePhone',
        'line1',
        'line2',
        'suburb',
        'regionId',
        'zipCode',
        'relation',
        'kinsfirstName',
        'kinslastName',
        'kinsmobilePhone',
        'kinshomePhone',
        'kinsline1',
        'kinsline2',
        'kinssuburb',
        'kinsregionId',
        'kinszipCode',
        'kinsrelationId',
      ];

      keysToRemove.forEach((key) => delete data[key]);

      if (this.id) {
        const sub = this.appilcationService
          .createOrUpdateSteps(data, 'Step2', this.id)
          .subscribe({
            next: (res) => {
              this.router.navigate([
                '/applications/edit/' + this.id + '/step3',
              ]);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      }
    } else {
      this.step2.markAllAsTouched();
      this.scrollService.scrollToFirstInvalid()
    }
  }
  approveStep(status: string) {
    const data = Object.assign({});
    if (this.approvalForm.value.reason != '') {
      data.reason = this.approvalForm.value.reason
    };
    data.status = status;
    const sub = this.appilcationService
      .approveStep(this.id, data, 'Step2')
      .subscribe({
        next: (res) => {
          this.router.navigate(['/applications/view/' + this.id + '/step3']);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }
  getChangeValue(value: string, relationType: 'kin' | 'spouse') {
    const contacts = this.step2Changes?.emergencyContacts || [];
    if (contacts.length === 0) return null;

    // Check if it's an address field
    const isAddressField = [
      'line1',
      'line2',
      'suburb',
      'regionId',
      'zipCode',
    ].includes(value);

    // Find the contact with the desired relation
    const contact = contacts.find(
      (c: any) => c.type?.toLowerCase() === relationType.toLowerCase()
    );


    if (!contact) return null;

    // Return address or direct value
    return isAddressField
      ? contact.address?.[value] ?? null
      : contact[value] ?? null;
  }

  edit() {
    this.router.navigate(['/applications/edit/' + this.id + '/step2']);
  }

  customRequired(required: boolean) {
    const fields = [
      'firstName',
      'lastName',
      'mobilePhone',
      'relationId',
      'line1',
      'suburb',
      'regionId',
      'zipCode',
    ];
    fields.forEach((field) => {
      const control = this.step2.get(field);
      if (control) {
        const existingValidators = control.validator ? [control.validator] : [];
        if (required == true) {
          control.setValidators([...existingValidators, Validators.required]);
        } else {
          control.clearValidators();
          if (field === 'mobilePhone' || field === 'homePhone') {
            control.setValidators([Validators.pattern(/^\+?[0-9]\d{9,14}$/)]);
          }
        }

        control.updateValueAndValidity();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
