import { Component, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { Disciplinary } from '../../../core/modals';
import { Pagination } from '../../../core/modals/pagination';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DisciplinaryService } from '../../../_services/dataServices/disciplinary.service';
import { PaginationService } from '../../../_services/common/pagination.service';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { MatDialog } from '@angular/material/dialog';
import { ChooseEmployeeComponent } from '../aod/choose-employee/choose-employee.component';

@Component({
  selector: 'app-disciplinary',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './disciplinary.component.html',
  styleUrl: './disciplinary.component.scss'
})
export class DisciplinaryComponent implements OnInit {
  dataSource: Disciplinary[] = [];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
 
  constructor(
    private disciplinaryService: DisciplinaryService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    public badgeColorService: BadgeColorService,
    private dialog: MatDialog,
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
      this.getAllDisciplinaries();
    });
  }
  ngOnInit(): void { }

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

  getAllDisciplinaries() {
    const sub = this.disciplinaryService
      .getAllDisciplinaries(this.queryParams)
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

  chooseEmployee() {
    const DialogRef = this.dialog.open(ChooseEmployeeComponent, {
      data: { type: 'disciplinary' , text:'Search and Choose the Employee this Disciplinary Request will be for' },
      width: '60%',
      height: '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      sub.unsubscribe();
    });
  }

  // deleteDisciplinary(id: string) {
  //   const isub = this.messageService
  //     .prompt(
  //       `Confirm Deletion`,
  //       'Are you sure you want to delete this disciplinary request?'
  //     )
  //     .afterClosed()
  //     .pipe(
  //       filter((_confirmed: boolean) => _confirmed),
  //       switchMap(() => {
  //         return this.disciplinaryService.deleteDisciplinary(id);
  //       })
  //     )
  //     .subscribe({
  //       next: (res) => {
  //         this.getAllDisciplinaries();
  //         isub.unsubscribe();
  //       },
  //       error: (res) => {
  //         isub.unsubscribe();
  //       },
  //     });
  // }
}

