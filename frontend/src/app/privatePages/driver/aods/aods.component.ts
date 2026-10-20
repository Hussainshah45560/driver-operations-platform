import { Component } from '@angular/core';
import { Pagination } from '../../../core/modals/pagination';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationService } from '../../../_services/common/pagination.service';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { AodsService } from '../../../_services/dataServices/aods.service';

@Component({
  selector: 'app-aods',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './aods.component.html',
  styleUrl: './aods.component.scss',
})
export class AodsComponent {
  dataSource!: any;
  pager: Pagination | any;
  queryParams: Params = {};
  searchForm: FormGroup;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagination: PaginationService,
    private formBuilder: FormBuilder,
    private aodsService: AodsService,
  ) {
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

  sort(field: string, order: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderby: field, orderdir: order },
      queryParamsHandling: 'merge',
    });
  }

  getAllAods() {
    const sub = this.aodsService.getAllAods(this.queryParams).subscribe({
      next: (res) => {
        this.dataSource = res.data;
        this.pager = this.pagination.compile(res.pagination);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  ngOnDestroy(): void {}
}
