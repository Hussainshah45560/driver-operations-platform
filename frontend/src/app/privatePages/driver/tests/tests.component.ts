import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Pagination } from '../../../core/modals/pagination';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { PaginationService } from '../../../_services/common/pagination.service';
import { TestsService } from '../../../_services/dataServices/tests.service';
import { Tests } from '../../../core/modals';
import moment from 'moment';
import { AuthService } from '../../../_services/common/auth.service';
import { ChooseEmployeeComponent } from '../../admin/aod/choose-employee/choose-employee.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tests',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './tests.component.html',
  styleUrl: './tests.component.scss',
})
export class TestsComponent implements OnInit, OnDestroy {
  searchForm!: FormGroup;
  dataSource!: Tests[];
  queryParams: Params = {};
  pager: Pagination | any;
  moment = moment;
  role!: string;
  qSub: Subscription;
  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private pagination: PaginationService,
    private testsService: TestsService,
    private badgeColorService: BadgeColorService,
    private authService: AuthService,
  ) {
    this.searchForm = this.formBuilder.group({
      searchTerm: [''],
    });
    this.role = this.authService.userDetails?.role?.name ?? '';
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      if (this.queryParams['q'] != null) {
        this.searchForm.patchValue({
          searchTerm: this.queryParams['q'],
        });
      }
      this.getAllTests();
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

  getAllTests() {
    const sub = this.testsService.getAllTests(this.queryParams).subscribe({
      next: (res) => {
        this.dataSource = res.data;
        this.pager = this.pagination.compile(res.pagination);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  chooseEmployee() {
    const DialogRef = this.dialog.open(ChooseEmployeeComponent, {
      data: { type: 'booking', text: 'To Book a test for', title: 'Candidate' },
      width: '60%',
      height: '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllTests();
      sub.unsubscribe();
    });
  }
  ngOnDestroy(): void {
    this.qSub.unsubscribe();
  }
}
