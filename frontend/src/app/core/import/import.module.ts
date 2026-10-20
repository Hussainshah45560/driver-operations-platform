import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PermissionsDirective } from './permissions.directive';
import { StatusDirective } from './status.directive';
import { NgOtpInputModule } from 'ng-otp-input';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
@NgModule({
  declarations: [PermissionsDirective, StatusDirective],
  imports: [
    NgOtpInputModule,
    CommonModule,
    MatButtonModule,
    MatRipple,
    JsonPipe,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatChipsModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatStepperModule,
    MatIconModule,
    FormsModule,
    AngularSignaturePadModule,

  ],
  exports: [
    AngularSignaturePadModule,
    CommonModule,
    MatButtonModule,
    MatRipple,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    RouterLink,
    RouterLinkActive,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatChipsModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatStepperModule,
    MatIconModule,
    PermissionsDirective,
    StatusDirective,
    NgOtpInputModule
  ],
})
export class ImportModule { }
