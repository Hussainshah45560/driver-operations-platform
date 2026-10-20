import { Component, OnDestroy, OnInit } from '@angular/core';
import { NewTestTypeComponent } from './new-test-type/new-test-type.component';
import { filter, Subscription, switchMap } from 'rxjs';
import { TestTypesService } from '../../../../_services/dataServices/testsTypes.service';
import { MessageService } from '../../../../_services/common/message.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PaginationService } from '../../../../_services/common/pagination.service';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Pagination } from '../../../../core/modals/pagination';
import { SettingData } from '../../../../core/modals';
import { ImportModule } from '../../../../core/import/import.module';
import { PaginationComponent } from '../../../../core/pagination/pagination.component';

@Component({
  selector: 'app-test-type',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './test-type.component.html',
  styleUrl: './test-type.component.scss',
})
export class TestTypeComponent implements OnInit, OnDestroy {
  dataSource!: SettingData[];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  constructor(
    private testTypesService: TestTypesService,
    private messageService: MessageService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      this.getAllTestTypes();
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

  getAllTestTypes() {
    const sub = this.testTypesService
      .getAllTestTypes(this.queryParams)
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
    const DialogRef = this.dialog.open(NewTestTypeComponent, {
      data: { id: id },
      width: '80%',
      height: isMobile ? '70%' : '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllTestTypes();
      sub.unsubscribe();
    });
  }

  deleteTestType(id: string) {
    const isub = this.messageService
      .prompt(
        `Confirm Deletion`,
        'Are you sure you want to delete this test type?',
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.testTypesService.deleteTestType(id);
        }),
      )
      .subscribe({
        next: (res) => {
          this.getAllTestTypes();
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
