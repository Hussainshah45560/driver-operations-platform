import { Component, Inject, Optional } from '@angular/core';
import { CalendarsService } from '../../../../_services/dataServices/calendars.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImportModule } from '../../../../core/import/import.module';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { Calendar } from '../../../../core/modals';

@Component({
  selector: 'app-new-calendar',
  standalone: true,
  imports: [ImportModule, VMessageComponent],
  templateUrl: './new-calendar.component.html',
  styleUrl: './new-calendar.component.scss',
})
export class NewCalendarComponent {
  form: FormGroup;
  id!:string;
  dataSource!:Calendar
  constructor(
    private calendarsService: CalendarsService,
    private formBuilder: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<NewCalendarComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      calendlyAddress: ['', [Validators.required, Validators.pattern(/^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9@:%._+~#?&/=~-]*)?$/)]],
    });
    if (this.data) {
      this.id = this.data.id;
      this.getSingleCalendar(this.id);
    }
  }

  getSingleCalendar(id: string) {
    const sub = this.calendarsService.getSingleCalendar(id).subscribe({
      next: (res) => {
        this.dataSource = res.data;
        this.form.patchValue({
          name: res.data.name ?? '',
          calendlyAddress: res.data.calendlyAddress ?? '',
        });
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }
  updateStatus(id: string) {
    const sub = this.calendarsService.updateStatus(id).subscribe({
      next: (res) => {
        this.getSingleCalendar(this.id);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }
  submit() {
    if (this.form.valid) {
      const data = this.form.value;
      if (this.id != '' && this.id != undefined) {
        const sub = this.calendarsService
          .createOrUpdateCalendar(data, this.id)
          .subscribe({
            next: (res) => {
              this.close();
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {
        const sub = this.calendarsService
          .createOrUpdateCalendar(data)
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
    } else {
      this.form.markAllAsTouched();
    }
  }

  close() {
    this.dialogRef.close();
  }
}
