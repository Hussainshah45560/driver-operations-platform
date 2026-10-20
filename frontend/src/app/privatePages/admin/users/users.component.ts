import { Component, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { UsersService } from '../../../_services/dataServices/users.service';
import { lookupData, User } from '../../../core/modals';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MessageService } from '../../../_services/common/message.service';
import { filter, Subscription, switchMap } from 'rxjs';
import { Pagination } from '../../../core/modals/pagination';
import { PaginationService } from '../../../_services/common/pagination.service';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LookupService } from '../../../_services/dataServices/lookup.service';
import { LbAutoCompleteComponent } from '../../../core/lb-auto-complete/lb-auto-complete.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ImportModule, PaginationComponent, LbAutoCompleteComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  dataSource: User[] = [];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  selectRoles: lookupData[] = [];
  isDisabled: boolean = false;
  constructor(
    private usersService: UsersService,
    private router: Router,
    private messageService: MessageService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private lookupService: LookupService
  ) {
    this.searchForm = this.formBuilder.group({
      searchTerm: [''],
      roleId: ['']
    });
    this.qSub = this.route.queryParams.subscribe((res) => {
      this.queryParams = Object.assign({}, res);
      if (this.queryParams['q'] != null) {
        this.searchForm.patchValue({
          searchTerm: this.queryParams['q']
        })
      }
      this.getAllUsers();

    });
    this.getRolesLookup();
  }
  ngOnInit(): void { }

  onRoleChange(selected: any[]) {
    const roleId = selected?.length ? selected.join(',') : null;
    this.filter({ roleId });
  }

  filter(f: Params) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: f,
      queryParamsHandling: 'merge',
    });
  }

  clearFilters() {
    if (this.queryParams) {
      this.searchForm.reset();
      this.router.navigate([], {
        queryParams: {}
      });
    }
  }
  
  isObjectEmpty(objectName: {}) {
    return Object.keys(objectName).length;
  }

  sort(field: string, order: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderby: field, orderdir: order },
      queryParamsHandling: 'merge',
    });
  }

  getRolesLookup() {
    const sub = this.lookupService.getRolesLookup({lookup:true}).subscribe({
      next: (res) => {
        this.selectRoles = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  getAllUsers() {
    const sub = this.usersService.getAllUsers(this.queryParams).subscribe({
      next: (res: any) => {
        this.dataSource = res.data;
        this.pager = this.pagination.compile(res.pagination);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  updateStatus(id: string) {
    const sub = this.usersService.updateStatus(id).subscribe({
      next: (res) => {
        this.getAllUsers();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  deleteUser(id: string) {
    const isub = this.messageService
      .prompt(`Confirm Deletion`, 'Are you sure you want to delete this user?')
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.usersService.deleteUser(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllUsers();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }
}
