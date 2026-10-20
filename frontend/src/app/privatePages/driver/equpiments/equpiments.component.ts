import { Component } from '@angular/core';
import { Pagination } from '../../../core/modals/pagination';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationService } from '../../../_services/common/pagination.service';
import { EquipmentsService } from '../../../_services/dataServices/equipments.service';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';
import { DriverEquipment } from '../../../core/modals';
import moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-equpiments',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './equpiments.component.html',
  styleUrl: './equpiments.component.scss',
})
export class EqupimentsComponent {
  dataSource!: DriverEquipment[];
  pager: Pagination | any;
  queryParams: Params = {};
  searchForm: FormGroup;
  moment = moment;
  qSub: Subscription;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagination: PaginationService,
    private formBuilder: FormBuilder,
    private equipmentService: EquipmentsService,
    private badgeColorService: BadgeColorService,
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
      this.getAllEquipments();
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

  getAllEquipments() {
    const sub = this.equipmentService
      .getAllDriverEquipments(this.queryParams)
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

  ngOnDestroy(): void {
    this.qSub.unsubscribe();
  }
}
