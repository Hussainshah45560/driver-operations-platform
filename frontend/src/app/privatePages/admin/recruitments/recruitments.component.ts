import { Component, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { Pagination } from '../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationService } from '../../../_services/common/pagination.service';
import { Recruitment } from '../../../core/modals';
import { MessageService } from '../../../_services/common/message.service';
import { RecruitmentsService } from '../../../_services/dataServices/recruitments.service';
import moment from 'moment';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';

@Component({
  selector: 'app-recruitments',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './recruitments.component.html',
  styleUrl: './recruitments.component.scss'
})
export class RecruitmentsComponent implements OnInit {
  dataSource: Recruitment[] = [];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  moment = moment;
  constructor(
    private recruitmentsService: RecruitmentsService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    public badgeColorService: BadgeColorService

  ) {
    this.searchForm = this.formBuilder.group({
      searchTerm: [''],
    });
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      if (this.queryParams['q'] != null) {
        this.searchForm.patchValue({
          searchTerm: this.queryParams['q'],
        });
      }
      this.getAllRecruitments();
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

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getAllRecruitments() {
    const sub = this.recruitmentsService.getAllRecruitments(this.queryParams).subscribe({
      next: (res) => {
        this.dataSource = res.data;
        this.pager = this.pagination.compile(res.pagination);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }


  deleteRecruitment(id: string) {
    const isub = this.messageService
      .prompt(`Confirm Deletion`, 'Are you sure you want to delete this recruitment request?')
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.recruitmentsService.deleteRecruitment(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllRecruitments();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }
  updateStatus(id: string) {
    const sub = this.recruitmentsService.updateStatus(id).subscribe({
      next: (res) => {
        this.getAllRecruitments();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

}