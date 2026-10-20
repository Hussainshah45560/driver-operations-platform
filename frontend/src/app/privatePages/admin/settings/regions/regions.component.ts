import { Component, OnDestroy, OnInit } from '@angular/core';
import { SettingData } from '../../../../core/modals';
import { Pagination } from '../../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MessageService } from '../../../../_services/common/message.service';
import { PaginationService } from '../../../../_services/common/pagination.service';
import { RegionsService } from '../../../../_services/dataServices/regions.service';
import { MatDialog } from '@angular/material/dialog';
import { NewRegionComponent } from './new-region/new-region.component';
import { ImportModule } from '../../../../core/import/import.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationComponent } from '../../../../core/pagination/pagination.component';

@Component({
  selector: 'app-regions',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './regions.component.html',
  styleUrl: './regions.component.scss'
})
export class RegionsComponent implements OnInit, OnDestroy {
  dataSource: SettingData[] = [];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  constructor(
    private regionService: RegionsService,
    private messageService: MessageService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.qSub = this.route.queryParams.subscribe(res => {
      Object.assign(this.queryParams, res);
      this.getAllRegions();
    });
    this.searchForm = this.formBuilder.group({
      searchTerm: ['']
    })
  }
  ngOnInit(): void {

  }

  search(searchTerm: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: searchTerm },
      queryParamsHandling: 'merge',
    });
  }

  getAllRegions() {
    const sub = this.regionService.getAllRegions(this.queryParams).subscribe({
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
    const DialogRef = this.dialog.open(NewRegionComponent, {
      data: { id: id },
      width: '80%',
      height: isMobile ? '70%' : '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllRegions();
      sub.unsubscribe();
    });

  }

  deleteRegion(id: string) {
    const isub = this.messageService
      .prompt(`Confirm Deletion`, 'Are you sure you want to delete this region?')
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.regionService.deleteRegion(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllRegions();
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