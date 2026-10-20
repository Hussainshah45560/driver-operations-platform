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
import { ClearanceTypesService } from '../../../../_services/dataServices/clearanceTypes.service';
import { NewClearanceTypeComponent } from './new-clearance-type/new-clearance-type.component';

@Component({
  selector: 'app-clearance-type',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './clearance-type.component.html',
  styleUrl: './clearance-type.component.scss',
})
export class ClearanceTypeComponent implements OnInit, OnDestroy {
  dataSource: SettingData[] = [];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  constructor(
    private clearanceTypes: ClearanceTypesService,
    private messageService: MessageService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      this.getAllClearanceTypes();
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

  getAllClearanceTypes() {
    const sub = this.clearanceTypes
      .getAllClearanceTypes(this.queryParams)
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
    const DialogRef = this.dialog.open(NewClearanceTypeComponent, {
      data: { id: id },
      width: '80%',
      height: isMobile ? '70%' : '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllClearanceTypes();
      sub.unsubscribe();
    });
  }

  deleteClearanceType(id: string) {
    const isub = this.messageService
      .prompt(
        `Confirm Deletion`,
        'Are you sure you want to delete this clearance type?',
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.clearanceTypes.deleteClearanceType(id);
        }),
      )
      .subscribe({
        next: (res) => {
          this.getAllClearanceTypes();
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
