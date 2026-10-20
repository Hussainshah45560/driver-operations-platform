import { Component, OnDestroy, OnInit } from '@angular/core';
import { VehicleInspection } from '../../../core/modals';
import { Pagination } from '../../../core/modals/pagination';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationService } from '../../../_services/common/pagination.service';
import { VehicleInspectionService } from '../../../_services/dataServices/vehicleInspection.service';
// import { MessageService } from '../../../_services/common/message.service';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';
import moment from 'moment';
import { Subscription } from 'rxjs';
// import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-vehicle-inspection',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './vehicle-inspection.component.html',
  styleUrl: './vehicle-inspection.component.scss',
})
export class VehicleInspectionComponent implements OnInit, OnDestroy {
  dataSource: VehicleInspection[] = [];
  pager: Pagination | any;
  queryParams: Params = {};
  searchForm: FormGroup;
  moment = moment;
  qSub: Subscription;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagination: PaginationService,
    private vehicleInspectionService: VehicleInspectionService,
    private formBuilder: FormBuilder,
    private badgeColorService: BadgeColorService,
    // private messageService: MessageService,
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
      this.getAllVehicleInspection();
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
  getAllVehicleInspection() {
    const sub = this.vehicleInspectionService
      .getAllVehicleInspection(this.queryParams)
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

  // deleteVehicleInspection(id: string) {
  //   const isub = this.messageService
  //     .prompt(`Confirm Deletion`, 'Are you sure you want to delete this vehicle Inspection?')
  //     .afterClosed()
  //     .pipe(
  //       filter((_confirmed: boolean) => _confirmed),
  //       switchMap(() => {
  //         return this.vehicleInspectionService.deleteVehicleInspection(id);
  //       }),
  //     )
  //     .subscribe({
  //       next: (res) => {
  //         this.getAllVehicleInspection();
  //         isub.unsubscribe();
  //       },
  //       error: (res) => {
  //         isub.unsubscribe();
  //       },
  //     });
  // }

  ngOnDestroy(): void {
    this.qSub.unsubscribe();
  }
}
