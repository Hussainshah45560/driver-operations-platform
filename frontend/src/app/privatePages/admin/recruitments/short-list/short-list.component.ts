import { Component, OnDestroy, OnInit } from '@angular/core';
import { Candidates } from '../../../../core/modals';
import { Pagination } from '../../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PaginationService } from '../../../../_services/common/pagination.service';
import { ImportModule } from '../../../../core/import/import.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationComponent } from '../../../../core/pagination/pagination.component';
import { RecruitmentsService } from '../../../../_services/dataServices/recruitments.service';
import { MatDialog } from '@angular/material/dialog';
import { ReferenceComponent } from '../reference/reference.component';
import { MessageService } from '../../../../_services/common/message.service';
import moment from 'moment';
import { CandidateDetailsComponent } from '../candidate-details/candidate-details.component';
import { BadgeColorService } from '../../../../_services/common/badgeColor.service';
@Component({
  selector: 'app-short-list',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './short-list.component.html',
  styleUrl: './short-list.component.scss'
})
export class ShortListComponent implements OnInit, OnDestroy {
  dataSource: Candidates[] = [];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  recruitmentId!: string;
  params: Params = {};
  routSub!: Subscription;
  moment = moment;
  constructor(
    private recruitmentService: RecruitmentsService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private messageService: MessageService,
    private badgeColorService: BadgeColorService
  ) {

    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.recruitmentId = params['id'];
    });

    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      this.getAllShortList();
    });
    this.searchForm = this.formBuilder.group({
      searchTerm: ['']
    })
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


  getAllShortList() {
    const params = Object.assign({}, this.queryParams);
    params['recruitment_id'] = this.recruitmentId;
    const sub = this.recruitmentService
      .getAllShortList(params)
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

  finaliseCandidate(id: string) {
    const data = Object.assign({});
    data.finalisedId = id;
    const sub = this.recruitmentService
      .finaliseCandidate(this.recruitmentId, data)
      .subscribe({
        next: (res) => {
          this.getAllShortList();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }


  referencePopup(ref: []) {
    const DialogRef = this.dialog.open(ReferenceComponent, {
      data: { ref: ref },
      minWidth: '700px',
      maxWidth: '90vw',
      width: 'auto',
      height: 'auto',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllShortList();
      sub.unsubscribe();
    });
  }


  removeShortListedCandidate(id: string) {
    const data = Object.assign({});
    data.shortListedId = id;
    const isub = this.messageService
      .prompt(
        `Are you sure you want to remove this candidate?`,
        'The candidate will be removed from the shortlist and back into the view of candidates.',
        'Remove'
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.recruitmentService.removeShortListedCandidate(this.recruitmentId, data);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllShortList();
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
      this.getAllShortList();
      sub.unsubscribe();
    });
  }


  ngOnDestroy(): void {
    this.qSub.unsubscribe();
  }
}
