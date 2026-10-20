import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { Pagination } from '../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationService } from '../../../_services/common/pagination.service';
import { Induction, lookupData } from '../../../core/modals';
import { MessageService } from '../../../_services/common/message.service';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';
import { InductionService } from '../../../_services/dataServices/induction.service';
import moment from 'moment';
import { LbAutoCompleteComponent } from '../../../core/lb-auto-complete/lb-auto-complete.component';
@Component({
  selector: 'app-induction',
  standalone: true,
  imports: [ImportModule, PaginationComponent, LbAutoCompleteComponent],
  templateUrl: './induction.component.html',
  styleUrl: './induction.component.scss',
})
export class InductionComponent implements OnInit, OnDestroy {
  dataSource: Induction[] = [];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  moment = moment;
  selectStatus: lookupData[] = [
    { name: 'Passed', value: 'passed' },
    { name: 'Failed', value: 'failed' },
    { name: 'In Progress', value: 'in progress' },
    { name: 'In Contract', value: 'In contract' },
  ];
  constructor(
    private inductionService: InductionService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    public badgeColorService: BadgeColorService,
  ) {
    this.searchForm = this.formBuilder.group({
      searchTerm: [''],
      status: [''],
    });
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      if (this.queryParams['q'] != null) {
        this.searchForm.patchValue({
          searchTerm: this.queryParams['q'],
        });
      }
      this.getAllInductions();
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

  clearFilters() {
    if (this.queryParams) {
      this.searchForm.reset();
      this.router.navigate([], {
        queryParams: {},
      });
      this.queryParams = {};
    }
  }
  isObjectEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
  }

  onStatusChange(selected: any[]) {
    const status = selected;
    this.filter({ 'induction.status': status });
  }

  filter(f: Params) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: f,
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

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getAllInductions() {
    const sub = this.inductionService
      .getAllInductions(this.queryParams)
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

  deleteInduction(id: string) {
    const isub = this.messageService
      .prompt(
        `Confirm Deletion`,
        'Are you sure you want to delete this induction request?',
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.inductionService.deleteInduction(id);
        }),
      )
      .subscribe({
        next: (res) => {
          this.getAllInductions();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }
  ngOnDestroy(): void {
    this.qSub.unsubscribe();
  }
}
