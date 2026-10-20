import { Component, OnInit } from '@angular/core';
import { Params } from '@angular/router';
import { ImportModule } from '../../core/import/import.module';
import { LbAutoCompleteComponent } from '../../core/lb-auto-complete/lb-auto-complete.component';
import { VMessageComponent } from '../../core/v-message/v-message.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lookupData, User } from '../../core/modals';
import { LookupService } from '../../_services/dataServices/lookup.service';
import { UsersService } from '../../_services/dataServices/users.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { AuthService } from '../../_services/common/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ImportModule,
    LbAutoCompleteComponent,
    VMessageComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  form!: FormGroup;
  selectRegion: lookupData[] = [];
  selectRoles: lookupData[] = [];
  id!: string;
  showPassword: boolean = false;
  data!: User;
  params: Params = {};
  edit: boolean = false;
  profileId!: string;
  constructor(
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private usersService: UsersService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: [''],
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
    this.getProfileData();
    this.getRegionLookup();
    this.profileId = this.authService.userDetails?.profileId ?? '';
    if (!this.edit) {
      this.form.disable();
    }
  }

  ngOnInit(): void { }

  getProfileData() {
    const sub = this.usersService.getProfileData().subscribe({
      next: (res) => {
        this.data = res.data;
        this.form.patchValue({
          firstName: res.data?.firstName ?? '',
          lastName: res.data?.lastName ?? '',
          userName: res.data?.userName ?? '',
          email: res.data?.email ?? '',
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

  editForm() {
    this.edit = !this.edit;
    if (this.edit == true) {
      this.form.enable();
    } else {
      this.form.disable();
    }
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
  changePassword() {
    const DialogRef = this.dialog.open(ChangePasswordComponent, {
      data: {},
      width: '80%',
      height: 'auto',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {

      sub.unsubscribe();
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

      const sub = this.usersService.updateProfile(this.profileId, data).subscribe({
        next: (res) => {
          this.edit = false;
          this.getProfileData();
          sub.unsubscribe();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
    }

  }


}
