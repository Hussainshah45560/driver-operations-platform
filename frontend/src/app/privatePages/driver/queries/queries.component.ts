import { Component, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { Pagination } from '../../../core/modals/pagination';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';

@Component({
  selector: 'app-queries',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './queries.component.html',
  styleUrl: './queries.component.scss',
})
export class QueriesComponent implements OnInit {
  searchForm!: FormGroup;
  queryParams: Params = {};
  pager: Pagination | any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private badgeColorService: BadgeColorService,
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
  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }
}
