import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { PaginationService } from '../../../_services/common/pagination.service';
import { Pagination } from '../../../core/modals/pagination';
import { Asset } from '../../../core/modals';
import { AssetsService } from '../../../_services/dataServices/assets.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from '../../../_services/common/message.service';
import { filter, Subscription, switchMap } from 'rxjs';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.scss',
})
export class AssetsComponent implements OnInit, OnDestroy {
  dataSource: Asset[] = [];
  pager: Pagination | any;
  queryParams: Params = {};
  searchForm: FormGroup;
  qSub: Subscription;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagination: PaginationService,
    private assetsService: AssetsService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    public badgeColorService: BadgeColorService,
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
      this.getAllAssets();
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

  getAllAssets() {
    const sub = this.assetsService.getAllAssets(this.queryParams).subscribe({
      next: (res) => {
        this.dataSource = res.data;
        this.pager = this.pagination.compile(res.pagination);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  deleteAsset(id: string) {
    const isub = this.messageService
      .prompt(`Confirm Deletion`, 'Are you sure you want to delete this asset?')
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.assetsService.deleteAsset(id);
        }),
      )
      .subscribe({
        next: (res) => {
          this.getAllAssets();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }

  ngOnDestroy(): void {
    this.qSub.unsubscribe();
  }
}
