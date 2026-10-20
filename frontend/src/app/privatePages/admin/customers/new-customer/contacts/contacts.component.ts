import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../../../core/import/import.module';
import { PaginationComponent } from '../../../../../core/pagination/pagination.component';
import { Pagination } from '../../../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NewContactComponent } from './new-contact/new-contact.component';
import { MatDialog } from '@angular/material/dialog';
import { Contact } from '../../../../../core/modals';
import { PaginationService } from '../../../../../_services/common/pagination.service';
import { MessageService } from '../../../../../_services/common/message.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomersService } from '../../../../../_services/dataServices/customers.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent implements OnInit, OnDestroy {
  dataSource!: Contact[];
  pager: Pagination | any;
  qSub!: Subscription;
  queryParams: Params = {};
  sub!: Subscription | undefined;
  params: Params = {};
  id!: string;
  searchForm: FormGroup;

  constructor(
    private dialog: MatDialog,
    private messageService: MessageService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private customersService: CustomersService
  ) {
    this.searchForm = this.formBuilder.group({
      searchTerm: [''],
    });
    this.sub = this.route.parent?.params.subscribe(params => {
      this.params = params;
      this.id = params['id'];
    });
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      if (this.queryParams['q'] != null) {
        this.searchForm.patchValue({
          searchTerm: this.queryParams['q']
        })
      }
      this.getAllContacts();
    });

  }
  ngOnInit() {

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
  updateStatus(id: string) {
    const sub = this.customersService.updateContactStatus(id).subscribe({
      next: (res) => {

      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

 

  getAllContacts() {
    const params = { ...this.queryParams, customer_id: this.id };
    const sub = this.customersService
      .getAllContacts(params)
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
  newDialog(id: string = '') {
    const isMobile = window.innerWidth < 768;
    const DialogRef = this.dialog.open(NewContactComponent, {
      data: { customerId: this.id, id: id },
      width: '80%',
      height: isMobile ? '70%' : '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllContacts();
      sub.unsubscribe();
    });
  }

  submit() {
    this.router.navigate(['/customers/edit/' + this.id + '/configuration']);
  }




  deleteContact(id: string) {
    const isub = this.messageService
      .prompt(
        `Confirm Deletion`,
        'Are you sure you want to delete this contact?'
      )
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.customersService.deleteContact(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllContacts();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.qSub.unsubscribe();
  }
}
