import { Component, OnInit } from '@angular/core';
import { PaginationComponent } from '../../../../core/pagination/pagination.component';
import { ImportModule } from '../../../../core/import/import.module';
import { EmailTemplate } from '../../../../core/modals';
import { Pagination } from '../../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmailTemplateService } from '../../../../_services/dataServices/emailTemplate.service';
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
  dataSource: EmailTemplate[] = [];
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  id!: string;
  searchForm: FormGroup;
  constructor(
    private emailTemplateService: EmailTemplateService,
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
      if (this.queryParams['emailTypeId']) {
        this.getAllEmailTemplates();
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

  getAllEmailTemplates() {
    const sub = this.emailTemplateService
      .getAllEmailTemplates(this.queryParams['emailTypeId'])
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

  editEmail(id: string) {
    this.router.navigate(['/emails/edit/' + id]);
  }

  updateStatus(id: string) {
    const data = Object.assign({});
    data.emailTypeId = this.queryParams['emailTypeId'] ?? '';
    const sub = this.emailTemplateService.updateStatus(id, data).subscribe({
      next: (res) => {
        this.getAllEmailTemplates();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  deleteEmailTemplate(id: string) {
    const isub = this.messageService
      .prompt(
        `Confirm Deletion?`,
        'Are you sure you want to delete this template?'
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.emailTemplateService.deleteEmailTemplate(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllEmailTemplates();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }
}
