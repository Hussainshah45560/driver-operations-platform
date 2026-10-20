import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { filter, Subscription, switchMap } from 'rxjs';
import { MessageService } from '../../../_services/common/message.service';
import { Pagination } from '../../../core/modals/pagination';
import { Checklist } from '../../../core/modals';
import { ChecklistsService } from '../../../_services/dataServices/checklists.service';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { PaginationService } from '../../../_services/common/pagination.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-checklists',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './checklists.component.html',
  styleUrl: './checklists.component.scss',
})
export class ChecklistsComponent {
  dataSource: Checklist[] = [];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  constructor(
    private checklistsService: ChecklistsService,
    private messageService: MessageService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private router: Router,
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
      this.getAllChecklists();
    });
  }

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

  getAllChecklists() {
    const sub = this.checklistsService
      .getAllChecklists(this.queryParams)
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

  add() {
    this.router.navigate(['/checklists/new']);
  }
 
  updateStatus(id: string) {
    const sub = this.checklistsService.updateStatus(id).subscribe({
      next: (res) => {
        this.getAllChecklists();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  deleteChecklist(id: string) {
    const isub = this.messageService
      .prompt(
        `Confirm Deletion`,
        'Are you sure you want to delete this checklist?'
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.checklistsService.deleteChecklist(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllChecklists();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }
}
