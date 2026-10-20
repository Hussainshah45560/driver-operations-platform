import { Component, OnDestroy, OnInit } from '@angular/core';
import { Incidents } from '../../../core/modals';
import { Pagination } from '../../../core/modals/pagination';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationService } from '../../../_services/common/pagination.service';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';
import { IncidentsService } from '../../../_services/dataServices/incidents.service';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { FileSaverService } from '../../../_services/common/fileSaver.service';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './incidents.component.html',
  styleUrl: './incidents.component.scss',
})
export class IncidentsComponent implements OnInit, OnDestroy {
  dataSource!: Incidents;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  moment = moment;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagination: PaginationService,
    private formBuilder: FormBuilder,
    private incidentsService: IncidentsService,
    private badgeColorService: BadgeColorService,
    private fileSaverService: FileSaverService,

  ) {
    this.searchForm = this.formBuilder.group({
      searchTerm: [''],
    });
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      if (this.queryParams['q'] != null) {
        this.searchForm.patchValue({
          searchTerm: this.queryParams['q']
        })
      }
      this.getAllIncidents();
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
  downloadFile(url: string, name: string) {
    this.fileSaverService.downloadFile(url, name);
  }
  viewDocument(url: string) {
    window.open(url, '_blank');
  }
  
  getAllIncidents() {
    const sub = this.incidentsService
      .getAllIncidents(this.queryParams)
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
