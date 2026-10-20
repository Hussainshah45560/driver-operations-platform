import { Component, OnDestroy, OnInit } from '@angular/core';
import { Candidates } from '../../../../core/modals';
import { Pagination } from '../../../../core/modals/pagination';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PaginationService } from '../../../../_services/common/pagination.service';
import { ImportModule } from '../../../../core/import/import.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationComponent } from '../../../../core/pagination/pagination.component';
import { BadgeColorService } from '../../../../_services/common/badgeColor.service';
import { RecruitmentsService } from '../../../../_services/dataServices/recruitments.service';
import { ReferenceComponent } from '../reference/reference.component';
import { MatDialog } from '@angular/material/dialog';
import { CandidateDetailsComponent } from '../candidate-details/candidate-details.component';
import moment from 'moment';
@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './candidates.component.html',
  styleUrl: './candidates.component.scss'
})
export class CandidatesComponent implements OnInit, OnDestroy {
  dataSource: Candidates[] = [];
  recruitmentId!: string;
  params: Params = {};
  routSub!: Subscription;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: any = {};
  searchForm: FormGroup;
  moment = moment;
  filters: { name: string, selected: boolean }[] = [
    { name: 'Areas', selected: true },
    { name: 'Region', selected: true },
    { name: 'Skills', selected: true },
    { name: 'All', selected: false }
  ];
  constructor(
    private recruitmentService: RecruitmentsService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    public badgeColorService: BadgeColorService
  ) {

    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.recruitmentId = params['id'];
    });

    this.qSub = this.route.queryParams.subscribe((res) => {
      // const hasQueryParams = res && Object.keys(res).length > 0;
      Object.assign(this.queryParams, res)

      this.filters.forEach((filter) => {
        const key = filter.name.toLowerCase();
        filter.selected = res[key] !== undefined;
      });

      this.getAllCandidates();
    });

    this.searchForm = this.formBuilder.group({
      searchTerm: ['']
    })
  }
  ngOnInit(): void {
    if (Object.keys(this.queryParams).length == 0) {
      this.queryParams = { areas: true, skills: true, region: true };
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: this.queryParams,
        queryParamsHandling: '',
      });
    }

  }

  search(searchTerm: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: searchTerm },
      queryParamsHandling: 'merge',
    });
  }



  toggleFilter(filter: { name: string, selected: boolean }) {
    filter.selected = !filter.selected;
    const key = filter.name.toLowerCase();
    if (key == 'all' && filter.selected == true) {
      this.queryParams = { all: true }
    } else {
      if (filter.selected == true) {
        this.queryParams[key] = filter.selected;
        delete this.queryParams['all'];
      } else {
        delete this.queryParams[key];
      }
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.queryParams
    });
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getAllCandidates() {
    const params = Object.assign({}, this.queryParams);
    params['recruitment_id'] = this.recruitmentId;
    const sub = this.recruitmentService
      .getAllCandidates(params)
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

  sort(field: string, order: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderby: field, orderdir: order },
      queryParamsHandling: 'merge',
    });
  }

  referencePopup(ref: []) {

    const DialogRef = this.dialog.open(ReferenceComponent, {
      data: { ref: ref },
      minWidth: '700px',
      maxWidth: '90vw',
      width: 'auto',
      // height: 'auto',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllCandidates();
      sub.unsubscribe();
    });
  }

  shortListCandidate(id: string) {
    const data = Object.assign({});
    data.shortListedId = id;
    const sub = this.recruitmentService
      .shortListCandidate(this.recruitmentId, data)
      .subscribe({
        next: (res) => {
          this.getAllCandidates();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  candidateDetails(id: string, purpose: string) {

    const DialogRef = this.dialog.open(CandidateDetailsComponent, {
      data: { id: id, purpose: purpose },
      minWidth: '390px',
      maxWidth: '90vw',
      // maxHeight: '84vh',
      // minHeight: '84vh',
      width: '69vw',
      // height: 'auto',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllCandidates();
      sub.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    this.qSub.unsubscribe();
    this.routSub.unsubscribe();
  }
}
