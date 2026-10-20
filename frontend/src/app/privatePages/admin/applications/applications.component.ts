import { Component, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { Application } from '../../../core/modals';
import { ApplicationsService } from '../../../_services/dataServices/applications.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MessageService } from '../../../_services/common/message.service';
import { filter, Subscription, switchMap } from 'rxjs';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { PaginationService } from '../../../_services/common/pagination.service';
import { Pagination } from '../../../core/modals/pagination';
import moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';
import { StatusCheckService } from '../../../_services/dataServices/statusCheck.service';
import { PermissionService } from '../../../_services/common/permission.service';
@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss',
})
export class ApplicationsComponent implements OnInit {
  dataSource: Application[] = [];
  expandedApp: any = null;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  moment = moment;
  constructor(
    private applicationsService: ApplicationsService,
    private router: Router,
    private messageService: MessageService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public badgeColorService: BadgeColorService,
    public statusCheckService: StatusCheckService,
    public ps: PermissionService,
  ) {
    this.searchForm = this.formBuilder.group({
      searchTerm: [''],
    });
    this.qSub = this.route.queryParams.subscribe((res) => {
      this.queryParams = Object.assign(this.queryParams, res);
      if (this.queryParams['q'] != null) {
        this.searchForm.patchValue({
          searchTerm: this.queryParams['q']
        })
      }
      this.getAllApplications();
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

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getAllApplications() {
    const sub = this.applicationsService
      .getAllApplications(this.queryParams)
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

  editStep(i: number, applicationId: string) {
    this.router.navigate([
      '/applications/edit/' + applicationId + '/step' + (i + 1),
    ]);
  }

  viewStep(i: number, applicationId: string) {
    this.router.navigate([
      '/applications/view/' + applicationId + '/step' + (i + 1),
    ]);
  }

  expandTableRow(app: any) {
    this.expandedApp = this.expandedApp === app ? null : app;
  }

  viewApplication(applicationId: string) {
    this.router.navigate(['/applications/view/' + applicationId]);
  }

  deleteApplication(id: string) {
    const isub = this.messageService
      .prompt(`Are you sure you want to delete this record?`)
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.applicationsService.deleteApplication(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllApplications();
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
}
