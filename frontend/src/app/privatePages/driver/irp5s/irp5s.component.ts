import { Component } from '@angular/core';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { ImportModule } from '../../../core/import/import.module';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationService } from '../../../_services/common/pagination.service';
import { Irp5sService } from '../../../_services/dataServices/irp5s.service';
import { Pagination } from '../../../core/modals/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-irp5s',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './irp5s.component.html',
  styleUrl: './irp5s.component.scss',
})
export class Irp5sComponent {
  dataSource!: any;
  pager: Pagination | any;
  queryParams: Params = {};
  searchForm: FormGroup;
  qSub: Subscription;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagination: PaginationService,
    private formBuilder: FormBuilder,
    private irp5sService: Irp5sService,
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
      // this.getAllIrp5s();
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

  getAllIrp5s() {
    const sub = this.irp5sService.getAllIrp5s(this.queryParams).subscribe({
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
