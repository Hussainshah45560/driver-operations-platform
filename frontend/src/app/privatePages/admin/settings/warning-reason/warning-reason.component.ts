import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../../core/import/import.module';
import { PaginationComponent } from '../../../../core/pagination/pagination.component';
import { SettingData } from '../../../../core/modals';
import { Pagination } from '../../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from '../../../../_services/common/message.service';
import { PaginationService } from '../../../../_services/common/pagination.service';
import { MatDialog } from '@angular/material/dialog';
import { WarningReasonsService } from '../../../../_services/dataServices/warningReasons.service';
import { NewWarningReasonComponent } from './new-warning-reason/new-warning-reason.component';

@Component({
  selector: 'app-warning-reason',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './warning-reason.component.html',
  styleUrl: './warning-reason.component.scss'
})
export class WarningReasonComponent implements OnInit, OnDestroy {
  dataSource: SettingData[] = [];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  constructor(
    private warningReasons: WarningReasonsService,
    private messageService: MessageService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      this.getAllWarningReasons();
    });
    this.searchForm = this.formBuilder.group({
      searchTerm: [''],
    });
  }
  ngOnInit(): void {}

  search(searchTerm: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: searchTerm },
      queryParamsHandling: 'merge',
    });
  }

  getAllWarningReasons() {
    const sub = this.warningReasons
      .getAllWarningReasons(this.queryParams)
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
    const DialogRef = this.dialog.open(NewWarningReasonComponent, {
      data: { id: id },
      width: '80%',
      height: isMobile ? '70%' : '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllWarningReasons();
      sub.unsubscribe();
    });
  }

  deleteWarningReason(id: string) {
    const isub = this.messageService
      .prompt(
        `Confirm Deletion`,
        'Are you sure you want to delete this warning reason?',
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.warningReasons.deleteWarningReason(id);
        }),
      )
      .subscribe({
        next: (res) => {
          this.getAllWarningReasons();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }
  sort(field: string, order: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderby: field, orderdir: order },
      queryParamsHandling: 'merge',
    });
  }
  ngOnDestroy(): void {
    this.qSub.unsubscribe();
  }
}
