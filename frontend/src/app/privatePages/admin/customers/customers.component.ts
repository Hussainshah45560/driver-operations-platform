import { Component } from '@angular/core';
import { CustomersService } from '../../../_services/dataServices/customers.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PaginationService } from '../../../_services/common/pagination.service';
import { Customer } from '../../../core/modals';
import { Pagination } from '../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { MessageService } from '../../../_services/common/message.service';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
})
export class CustomersComponent {
  queryParams: Params = {};
  dataSource!: Customer[];
  pager: Pagination | any;
  qSub: Subscription;
  searchForm: FormGroup;
  constructor(
    private customersService: CustomersService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private pagination: PaginationService,
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
      this.getAllCustomers();
    });
  }

  getAllCustomers() {
    const sub = this.customersService
      .getAllCustomers(this.queryParams)
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

 
  deleteCustomer(id: string) {
    const isub = this.messageService
      .prompt(`Confirm Deletion`, 'Are you sure you want to delete this customer?')
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.customersService.deleteCustomer(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllCustomers();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }
  updateStatus(id:string) {
    const sub = this.customersService.updateCustomerStatus(id).subscribe({
      next: (res) => {
        this.getAllCustomers();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }
}
