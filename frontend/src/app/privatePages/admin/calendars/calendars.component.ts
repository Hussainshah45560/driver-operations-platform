import { Component, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { Calendar } from '../../../core/modals';
import { Pagination } from '../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MessageService } from '../../../_services/common/message.service';
import { PaginationService } from '../../../_services/common/pagination.service';
import { MatDialog } from '@angular/material/dialog';
import { CalendarsService } from '../../../_services/dataServices/calendars.service';
import { NewCalendarComponent } from './new-calendar/new-calendar.component';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-calendars',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './calendars.component.html',
  styleUrl: './calendars.component.scss',
})
export class CalendarsComponent implements OnInit {
  dataSource: Calendar[] = [];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  constructor(
    private calendarsService: CalendarsService,
    private messageService: MessageService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.searchForm = this.formBuilder.group({
      searchTerm: [''],
    });
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      if (this.queryParams['q'] != null) {
        this.searchForm.patchValue({
          searchTerm: this.queryParams['q']
        })
      }
      this.getAllCalendars();
    });

  }
  ngOnInit(): void { }

  search(searchTerm: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: searchTerm },
      queryParamsHandling: 'merge',
    });
  }
  sort(field: string, order: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderby: field, orderdir: order },
      queryParamsHandling: 'merge',
    });
  }

  getAllCalendars() {
    const sub = this.calendarsService
      .getAllCalendars(this.queryParams)
      .subscribe({
        next: (res) => {
          this.dataSource = res.data;
          this.pager = this.pagination.compile(res.pagination);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }
  newDialog(id: string = '') {
    const isMobile = window.innerWidth < 768;
    const DialogRef = this.dialog.open(NewCalendarComponent, {
      data: { id: id },
      width: '80%',
      height: isMobile ? 'auto' : '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllCalendars();
      sub.unsubscribe();
    });
  }

  updateStatus(id: string) {
    const sub = this.calendarsService.updateStatus(id).subscribe({
      next: (res) => {
        this.getAllCalendars();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  deleteCalendar(id: string) {
    const isub = this.messageService
      .prompt(
        `Confirm Deletion`,
        'Are you sure you want to delete this calendar?'
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.calendarsService.deleteCalendar(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllCalendars();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }
}
