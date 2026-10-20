import { Component, OnDestroy, OnInit } from '@angular/core';
import { Queries } from '../../../core/modals';
import { Pagination } from '../../../core/modals/pagination';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PaginationService } from '../../../_services/common/pagination.service';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { QueriesService } from '../../../_services/dataServices/queries.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AssignToAdminComponent } from './assign-to-admin/assign-to-admin.component';
import { AuthService } from '../../../_services/common/auth.service';
import moment from 'moment';

@Component({
  selector: 'app-queries',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './queries.component.html',
  styleUrl: './queries.component.scss',
})
export class QueriesComponent implements OnInit, OnDestroy {
  dataSource: Queries[] = [];
  id!: string;
  pager: Pagination | any;
  queryParams: Params = {};
  qSub!: Subscription;
  queryIds: string[] = [];
  role!: string;
  moment = moment;
  constructor(
    private queriesService: QueriesService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    public badgeColorService: BadgeColorService,
    private authService: AuthService,
  ) {

    this.role = this.authService.userDetails?.role?.name ?? '';
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      this.getAllQueries();
    });
  }
  ngOnInit(): void { }

  sort(field: string, order: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderby: field, orderdir: order },
      queryParamsHandling: 'merge',
    });
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getAllQueries() {
    if (['Driver'].includes(this.role)) {
      const sub = this.queriesService.getAllUserQueries(this.queryParams).subscribe({
        next: (res) => {
          this.dataSource = res.data;
          this.pager = this.pagination.compile(res.pagination);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
    } else {
      const sub = this.queriesService.getAllQueries(this.queryParams).subscribe({
        next: (res) => {
          this.dataSource = res.data;
          this.pager = this.pagination.compile(res.pagination);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
    }
  }

  assignToAdmin() {
    const DialogRef = this.dialog.open(AssignToAdminComponent, {
      data: { queryIds: this.queryIds },
      width: '60%',
      height: '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllQueries();
      sub.unsubscribe();
    });
  }

  onChange(req: string, checked: boolean) {
    if (checked) {
      this.queryIds = this.queryIds || []
      this.queryIds.push(req);
    } else {
      this.queryIds = this.queryIds?.filter((a: any) => a !== req);
    }
    console.log(this.queryIds)
  }


  ngOnDestroy(): void {
    this.qSub.unsubscribe();
  }
}
