import { Component, OnInit } from '@angular/core';
import { Pagination } from '../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Content } from '../../../core/modals';
import { MessageService } from '../../../_services/common/message.service';
import { PaginationService } from '../../../_services/common/pagination.service';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { ContentService } from '../../../_services/dataServices/content.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent implements OnInit {
  dataSource!: Content[];
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  id!: string;
  searchForm: FormGroup;
  constructor(
    private contentService: ContentService,
    private router: Router,
    private messageService: MessageService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
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
      this.getAllContents();
    });

  }

  ngOnInit() { }
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

  getAllContents() {
    const sub = this.contentService.getAllContents(this.queryParams).subscribe({
      next: (res) => {
        this.dataSource = res.data;
        this.pager = this.pagination.compile(res.pagination);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

 

  updateStatus(id: string) {
    const sub = this.contentService.updateStatus(id).subscribe({
      next: (res) => {
        this.getAllContents();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  deleteContent(id: string) {
    const isub = this.messageService
      .prompt(
        `Confirm Deletion?`,
        'Are you sure you want to delete this content?'
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.contentService.deleteContent(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllContents();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }
}
