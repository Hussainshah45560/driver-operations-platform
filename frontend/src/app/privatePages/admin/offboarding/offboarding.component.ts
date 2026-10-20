import { Component, OnInit } from '@angular/core';
import { Offboarding } from '../../../core/modals';
import { Pagination } from '../../../core/modals/pagination';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OffboardingService } from '../../../_services/dataServices/offboarding.service';
import { PaginationService } from '../../../_services/common/pagination.service';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { RejectionComponent } from './rejection/rejection.component';
import { MatDialog } from '@angular/material/dialog';
import { ChooseEmployeeComponent } from '../aod/choose-employee/choose-employee.component';
import moment from 'moment';

@Component({
  selector: 'app-offboarding',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './offboarding.component.html',
  styleUrl: './offboarding.component.scss',
})
export class OffboardingComponent implements OnInit {
  dataSource: Offboarding[] = [];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  moment = moment;
  constructor(
    private offboardingService: OffboardingService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
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
      this.getAllOffboardings();
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

  getAllOffboardings() {
    const sub = this.offboardingService
      .getAllOffboardings(this.queryParams)
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
    const DialogRef = this.dialog.open(RejectionComponent, {
      data: { id: id },
      width: '80%',
      height: isMobile ? '70%' : '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllOffboardings();
      sub.unsubscribe();
    });
  }

  chooseEmployee() {
    const DialogRef = this.dialog.open(ChooseEmployeeComponent, {
      data: { type: 'offBoarding' , text:'Search and Choose the Employee this Offboarding will be for' },
      width: '60%',
      height: '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      sub.unsubscribe();
    });
  }
}
