import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../../core/import/import.module';
import { LbAutoCompleteComponent } from '../../../../core/lb-auto-complete/lb-auto-complete.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { LookupService } from '../../../../_services/dataServices/lookup.service';
import { lookupData, User } from '../../../../core/modals';
import { UsersService } from '../../../../_services/dataServices/users.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [
    ImportModule,
    LbAutoCompleteComponent,
    VMessageComponent,
  ],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.scss',
})
export class NewUserComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  selectRegion: lookupData[] = [];
  selectRoles: lookupData[] = [];
  id!: string;
  showPassword: boolean = false;
  data!: User;
  params: Params = {};
  routSub: Subscription;
  constructor(
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      roleId: ['', Validators.required],
      password: ['', Validators.required],
      // branchId: [''],
      userName: ['', Validators.required],
      regionId: ['', Validators.required],
      email: ['', [Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]\d{9,14}$/)]],
      alternativeNumber: ['', [Validators.pattern(/^\+?[0-9]\d{9,14}$/)],
      ],
      line1: ['', Validators.required],
      line2: [''],
      suburb: ['', Validators.required],
      zipCode: ['', Validators.required],
      postalline1: ['', Validators.required],
      postalline2: [''],
      postalsuburb: ['', Validators.required],
      postalzipCode: ['', Validators.required],
      postalregionId: [''],
      sameAsPhysicalAddress: [false],
    });

    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getSingleUser(this.id);
      }
    });

    this.getRegionLookup();
    this.getRolesLookup();
  }

  ngOnInit(): void { }

  getSingleUser(id: string) {
    const sub = this.usersService.getSingleUser(id).subscribe({
      next: (res) => {
        this.data = res.data;
        this.form.patchValue({
          firstName: res.data?.firstName ?? '',
          lastName: res.data?.lastName ?? '',
          userName: res.data?.userName ?? '',
          email: res.data?.email ?? '',
          roleId: res.data?.roleId ?? '',
          // branch: res.data?.branch ?? '',
          phoneNumber: res.data?.phoneNumber ?? '',
          alternativeNumber: res.data?.alternativeNumber ?? '',
          line1: res.data?.physicalAddress?.line1 ?? '',
          line2: res.data?.physicalAddress?.line2 ?? '',
          suburb: res.data?.physicalAddress?.suburb ?? '',
          zipCode: res.data?.physicalAddress?.zipCode ?? '',
          regionId: res.data?.physicalAddress?.regionId ?? '',
          postalline1: res.data?.postalAddress?.line1 ?? '',
          postalline2: res.data?.postalAddress?.line2 ?? '',
          postalsuburb: res.data?.postalAddress?.suburb ?? '',
          postalzipCode: res.data?.postalAddress?.zipCode ?? '',
          postalregionId: res.data?.postalAddress?.regionId ?? '',
          sameAsPhysicalAddress: res.data?.postalAddress?.sameAsPhysicalAddress ?? false,
        });
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getRegionLookup() {
    const sub = this.lookupService
      .getSettingsLookup('Regions')
      .subscribe({
        next: (res) => {
          this.selectRegion = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getRolesLookup() {
    const sub = this.lookupService.getRolesLookup().subscribe({
      next: (res) => {
        this.selectRoles = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  sameAs() {
    let formData = this.form.value;
    if (formData.sameAsPhysicalAddress == true) {
      this.form.patchValue({
        postalline1: formData?.line1,
        postalline2: formData?.line2,
        postalsuburb: formData?.suburb,
        postalzipCode: formData?.zipCode,
        postalregionId: formData?.regionId,
      });
    } else {
      this.form.patchValue({
        postalline1: '',
        postalline2: '',
        postalsuburb: '',
        postalzipCode: '',
        postalregion: '',
      });
    }
  }
  onChange(value: string, event: any) {
    const current = this.form.get('roleId')?.value;
    if (event.checked) {
      this.form.get('roleId')?.setValue(value);
    } else if (current === value) {
      this.form.get('roleId')?.setValue(value);
    }
  }
  isChecked(value: string): boolean {
    return this.form.get('roleId')?.value === value;
  }


  updateStatus(id: string) {
    const sub = this.usersService.updateStatus(id).subscribe({
      next: (res) => {
        this.getSingleUser(this.id);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      data.physicalAddress = {
        "line1": data?.line1,
        "line2": data?.line2,
        "suburb": data?.suburb,
        "regionId": data?.regionId,
        "zipCode": data?.zipCode,
      }
      data.postalAddress = {
        "sameAsPhysicalAddress": data.sameAsPhysicalAddress,
        "line1": data?.postalline1,
        "line2": data?.postalline2,
        "suburb": data?.postalsuburb,
        "regionId": data?.postalregionId,
        "zipCode": data?.postalzipCode,
      }
      const keysToRemove = [
        'line1',
        'line2',
        'suburb',
        'regionId',
        'zipCode',
        'postalline1',
        'postalline2',
        'postalsuburb',
        'postalregionId',
        'postalzipCode',
        'sameAsPhysicalAddress'
      ];

      keysToRemove.forEach(key => delete data[key]);
      if (this.id != '' && this.id != undefined) {
        const sub = this.usersService
          .createOrUpdateUser(data, this.id)
          .subscribe({
            next: (res) => {
              this.router.navigate(['/users']);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {
        const sub = this.usersService.createOrUpdateUser(data).subscribe({
          next: (res) => {
            this.router.navigate(['/users']);
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
  }
}
