import { Component, OnDestroy, OnInit } from '@angular/core';
import { SettingData } from '../../../../core/modals';
import { Pagination } from '../../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MessageService } from '../../../../_services/common/message.service';
import { PaginationService } from '../../../../_services/common/pagination.service';
import { MatDialog } from '@angular/material/dialog';
import { ImportModule } from '../../../../core/import/import.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationComponent } from '../../../../core/pagination/pagination.component';
import { NationalityService } from '../../../../_services/dataServices/nationality.service';
import { NewNationalityComponent } from './new-nationality/new-nationality.component';


@Component({
  selector: 'app-nationality',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './nationality.component.html',
  styleUrl: './nationality.component.scss'
})
export class NationalityComponent implements OnInit, OnDestroy {
  dataSource: SettingData[] = [];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  search: FormGroup;
  constructor(
    private nationalityService: NationalityService,
    private messageService: MessageService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.qSub = this.route.queryParams.subscribe(res => {
      this.queryParams = Object.assign({}, res);
      this.getAllNationality();
    });
    this.search = this.formBuilder.group({
      searchTerm: ['']
    })
  }
  ngOnInit(): void {

  }

  getAllNationality() {
    const sub = this.nationalityService.getAllNationality(this.queryParams).subscribe({
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
    const DialogRef = this.dialog.open(NewNationalityComponent, {
      data: { id: id },
      width: '80%',
      height: isMobile ? '70%' : '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllNationality();
      sub.unsubscribe();
    });

  }

  deleteNationality(id: string) {
    const isub = this.messageService
      .prompt(`Confirm Deletion`, 'Are you sure you want to delete this nationality?')
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.nationalityService.deleteNationality(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllNationality();
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