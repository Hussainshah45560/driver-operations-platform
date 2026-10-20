import { Component, OnDestroy, OnInit } from '@angular/core';
import { lookupData, Tests } from '../../../../core/modals';
import { ImportModule } from '../../../../core/import/import.module';
import { LbAutoCompleteComponent } from '../../../../core/lb-auto-complete/lb-auto-complete.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupService } from '../../../../_services/dataServices/lookup.service';
import { TestsService } from '../../../../_services/dataServices/tests.service';
import moment from 'moment';
import { AuthService } from '../../../../_services/common/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, Subscription, switchMap } from 'rxjs';
import { MessageService } from '../../../../_services/common/message.service';
@Component({
  selector: 'app-book-test',
  standalone: true,
  imports: [ImportModule, LbAutoCompleteComponent],
  templateUrl: './book-test.component.html',
  styleUrl: './book-test.component.scss',
})
export class BookTestComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  routeSub!: Subscription;
  routeQSub!: Subscription;
  selectTestType: lookupData[] = [];
  selectYears: lookupData[] = [];
  selectMonths: lookupData[] = [];
  selectDays: lookupData[] = [];
  selectStatus: lookupData[] = [{ name: 'Booked', value: 'booked' }, { name: 'Passed', value: 'passed' }, { name: 'Failed', value: 'failed' }, { name: 'Canceled', value: 'canceled' }];
  selectTime: lookupData[] = [
    { name: '07:00', value: '07:00' },
    { name: '08:00', value: '08:00' },
    { name: '09:00', value: '09:00' },
    { name: '10:00', value: '10:00' },
    { name: '11:00', value: '11:00' },
    { name: '12:00', value: '12:00' },
    { name: '13:00', value: '13:00' },
    { name: '14:00', value: '14:00' },
    { name: '15:00', value: '15:00' },
    { name: '16:00', value: '16:00' },
    { name: '17:00', value: '17:00' },
    { name: '18:00', value: '18:00' },
    { name: '19:00', value: '19:00' }];
  timeSlots: any[] = [];
  selectedDay: any = null;
  moment = moment;
  testId!: string;
  userId: string = '';
  isView: boolean = false;
  isDaySelected: boolean = false;
  data !: Tests;
  isEdit: boolean = false;
  selectedTestType!: string;
  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private lookupService: LookupService, private testService: TestsService, private authService: AuthService, private router: Router) {

    this.form = this.formBuilder.group({
      testTypeId: ['', Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required],
      status: [''],
      time: ['']
    });

    this.routeQSub = this.route.queryParams.subscribe(params => {
      this.userId = params['profileId'];
    });

    if (this.userId == undefined) {
      this.userId = this.authService.userDetails?._id ?? '';
    }

    this.getTestTypesLookup();
    this.getNextYears();
  }

  ngOnInit(): void {
    const segments = this.router.url.split('/').filter(Boolean);
    this.isView = segments.includes('view');
    this.isEdit = segments.includes('edit');
    if (this.isView) {
      this.form.disable();
    }
    if (this.isEdit) {
      this.form.disable();
      this.form.get('status')?.enable();
    }
    this.routeSub = this.route.params.subscribe(params => {
      this.testId = params['id'];
      if (this.testId) {
        this.getSingleTest();
      }
    });
  }

  getSingleTest() {
    const sub = this.testService
      .getSingleTest(this.testId)
      .subscribe({
        next: (res) => {
          this.data = res.data;
          this.getMonthsByYear(this.moment(this.data?.date).format('YYYY'));
          this.getDaysOfMonth(this.moment(this.data?.date).format('YYYY'), this.moment(this.data?.date).format('MM'))
          this.form.patchValue({
            testTypeId: this.data?.testTypeId,
            month: this.moment(this.data?.date).format('MM') ?? '',
            year: this.moment(this.data?.date).format('YYYY') ?? '',
            status: this.data?.status ?? '',
            time: this.data?.time ?? ''
          });
          this.isDaySelected = true;
          this.selectedDay = this.moment(this.data?.date).format('D') ?? '';
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getTestTypesLookup() {
    const sub = this.lookupService
      .getSettingsLookup('TestTypes')
      .subscribe({
        next: (res) => {
          this.selectTestType = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getNextYears() {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.selectYears.push({ name: (currentYear + i).toString(), value: (currentYear + i).toString() });
    }
  }


  getMonthsByYear(selectedYear: string) {
    this.form.get('month')?.reset();
    this.selectMonths = [];
    this.selectDays = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    for (let i = 0; i < 12; i++) {
      this.selectMonths.push({
        name: monthNames[i],
        value: (i + 1).toString().padStart(2, "0"),
        disabled: selectedYear == currentYear.toString() && i < currentMonth

      });
    }
  }

  getDaysOfMonth(year: any, month: any) {
    this.selectDays = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const isCurrentMonth =
      year == today.getFullYear() &&
      month == today.getMonth() + 1;
    const weekdayNames = [
      "Sun", "Mon", "Tue", "Wed",
      "Thu", "Fri", "Sat"
    ];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dayName = weekdayNames[dateObj.getDay()];
      const isPastDay =
        isCurrentMonth && d < today.getDate();

      const isWeekend =
        dateObj.getDay() === 0 || dateObj.getDay() === 6;
      this.selectDays.push({
        name: d.toString(),
        value: d.toString(),
        label: d === today.getDate() && isCurrentMonth ? "Today" : dayName,
        disabled: isPastDay || isWeekend
      });
    }
  }

  onDaySelect(value: string) {
    this.selectedDay = value;
    this.isDaySelected = true;
  }


  // bookTest(time: string, slotId: string) {
  //   const data = Object.assign({});
  //   const formValue = Object.assign({}, this.form.value);
  //   data.testTypeId = formValue.testTypeId;
  //   data.time = time;
  //   data.userId = this.userId;
  //   data.slotId = slotId;
  //   data.date = formValue.year + '-' + formValue.month + '-' + this.selectedDay;
  //   const isub = this.messageService
  //     .prompt(
  //       `Confirm booking`,
  //       `Summary :
  //       Test: Drivers License
  //       Date: ${this.moment(data.date).format('dddd, MMMM D, YYYY')}
  //       Time: ${this.moment(data.time).format('hh:mm A')}`,
  //       'Confirm',
  //       'Book Test'
  //     )
  //     .afterClosed()
  //     .pipe(
  //       filter((_confirmed: boolean) => _confirmed),
  //       switchMap(() => {
  //         return this.testService.bookTest(data);
  //       })
  //     )
  //     .subscribe({
  //       next: (res) => {
  //         this.router.navigate(['/tests']);
  //         isub.unsubscribe();
  //       },
  //       error: (res) => {
  //         isub.unsubscribe();
  //       },
  //     });
  // }

  bookTest() {
    if (this.form.value.time != '') {
      const data = Object.assign({});
      const formValue = Object.assign({}, this.form.value);
      data.testTypeId = formValue.testTypeId;
      data.time = formValue.time;
      data.userId = this.userId;
      data.date = formValue.year + '-' + formValue.month + '-' + this.selectedDay;
      const result = this.selectTestType.find(x => x.value === formValue.testTypeId);
      this.selectedTestType = result?.name ?? '';
      const isub = this.messageService
        .prompt(
          `Confirm booking`,
          `Summary :
        Test: ${this.selectedTestType}
        Date: ${this.moment(data.date).format('dddd, MMMM D, YYYY')}
        Time: ${this.moment(data.time, 'HH:mm').format('hh:mm A')}`,
          'Confirm',
          'Book Test'
        )
        .afterClosed()
        .pipe(
          filter((_confirmed: boolean) => _confirmed),
          switchMap(() => {
            return this.testService.bookTest(data);
          })
        )
        .subscribe({
          next: (res) => {
            this.router.navigate(['/tests']);
            isub.unsubscribe();
          },
          error: (res) => {
            isub.unsubscribe();
          },
        });
    } else {
      this.form.get('time')?.markAllAsTouched();
    }

  }


  updateStatus(status: Event) {
    const data = Object.assign({});
    data.status = this.form.value.status;
    const sub = this.testService
      .updateStatus(data, this.testId)
      .subscribe({
        next: (res) => {
          this.router.navigate(['/tests']);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    this.routeQSub.unsubscribe();
  }


}
