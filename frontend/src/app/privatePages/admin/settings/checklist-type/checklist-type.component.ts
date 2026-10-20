import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../../core/import/import.module';
import { PaginationComponent } from '../../../../core/pagination/pagination.component';
import { SettingData } from '../../../../core/modals';
import { Pagination } from '../../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChecklistTypesService } from '../../../../_services/dataServices/checklistTypes.service';
import { MessageService } from '../../../../_services/common/message.service';
import { PaginationService } from '../../../../_services/common/pagination.service';
import { MatDialog } from '@angular/material/dialog';
import { NewChecklistTypeComponent } from './new-checklist-type/new-checklist-type.component';

@Component({
  selector: 'app-checklist-type',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './checklist-type.component.html',
  styleUrl: './checklist-type.component.scss',
})
export class ChecklistTypeComponent implements OnInit, OnDestroy {
  dataSource!: SettingData[];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  constructor(
    private checklistTypesService: ChecklistTypesService,
    private messageService: MessageService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      this.getAllChecklistTypes();
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

  getAllChecklistTypes() {
    const sub = this.checklistTypesService
      .getAllChecklistTypes(this.queryParams)
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
    const DialogRef = this.dialog.open(NewChecklistTypeComponent, {
      data: { id: id },
      width: '80%',
      height: isMobile ? '70%' : '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllChecklistTypes();
      sub.unsubscribe();
    });
  }

  deleteChecklistType(id: string) {
    const isub = this.messageService
      .prompt(
        `Confirm Deletion`,
        'Are you sure you want to delete this checklist type?',
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.checklistTypesService.deleteChecklistType(id);
        }),
      )
      .subscribe({
        next: (res) => {
          this.getAllChecklistTypes();
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
