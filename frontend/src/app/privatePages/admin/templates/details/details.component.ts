import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { filter, Subscription, switchMap } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationComponent } from '../../../../core/pagination/pagination.component';
import { ImportModule } from '../../../../core/import/import.module';
import { CmcTemplate } from '../../../../core/modals';
import { Pagination } from '../../../../core/modals/pagination';
import { TemplateService } from '../../../../_services/dataServices/template.service';
import { MessageService } from '../../../../_services/common/message.service';
import { PaginationService } from '../../../../_services/common/pagination.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  dataSource: CmcTemplate[] = [];
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;

  constructor(
    private templateService: TemplateService,
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
      if(this.queryParams['templateTypeId']){
        this.getAllTemplates();
      }
      
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

  getAllTemplates() {
    const sub = this.templateService
      .getAllTemplates(this.queryParams['templateTypeId'])
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

  updateStatus(id: string) {
    const sub = this.templateService.updateStatus(id).subscribe({
      next: (res) => {
        this.getAllTemplates();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  deleteTemplate(id: string) {
    const isub = this.messageService
      .prompt(
        `Confirm Deletion?`,
        'Are you sure you want to delete this template?'
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.templateService.deleteTemplate(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllTemplates();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }
}
