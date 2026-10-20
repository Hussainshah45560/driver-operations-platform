import { Component, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { Pagination } from '../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationService } from '../../../_services/common/pagination.service';
import { Aod } from '../../../core/modals';
import { AodsService } from '../../../_services/dataServices/aods.service';
import { MessageService } from '../../../_services/common/message.service';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { ViewSignedAodComponent } from './view-signed-aod/view-signed-aod.component';
import { ChooseEmployeeComponent } from './choose-employee/choose-employee.component';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';
import { AuthService } from '../../../_services/common/auth.service';
import { FileSaverService } from '../../../_services/common/fileSaver.service';

@Component({
  selector: 'app-aod',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './aod.component.html',
  styleUrl: './aod.component.scss',
})
export class AodComponent implements OnInit {
  dataSource: Aod[] = [];
  moment = moment;
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  role!: string;

  constructor(
    private aodsService: AodsService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private dialog: MatDialog,
    public badgeColorService: BadgeColorService,
    private authService: AuthService,
    private fileSaverService: FileSaverService
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
      this.role = this.authService.userDetails?.role?.name ?? '';
      this.getAllAods();
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


  getAllAods() {
    if (['Driver'].includes(this.role)) {
      const sub = this.aodsService.getAllAodsForDriver(this.queryParams).subscribe({
        next: (res) => {
          this.dataSource = res.data;
          this.pager = this.pagination.compile(res.pagination);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
    } else {
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
  }


  deleteAod(id: string) {
    const isub = this.messageService
      .prompt(`Confirm Deletion`, 'Are you sure you want to delete this aod?')
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.aodsService.deleteAod(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllAods();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }

  aodSigned(id: string, sign: string, signDate: string) {
    const DialogRef = this.dialog.open(ViewSignedAodComponent, {
      data: { _id: id, sign: sign, signDate: signDate },
      minWidth: '600px',
      maxWidth: '90vw',
      width: 'auto',
      height: '65%',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllAods();
      sub.unsubscribe();
    });
  }

  chooseEmployee() {
    const DialogRef = this.dialog.open(ChooseEmployeeComponent, {
      data: { type: 'aod', text: 'To Create an AOD for' },
      width: '60%',
      height: '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllAods();
      sub.unsubscribe();
    });
  }

  downloadFile(id: string) {
    const sub = this.aodsService.getTemplateToSign(id, { download: true }).subscribe({
      next: (res) => {
        this.fileSaverService.downloadFile(res.data.url, res.data.templateName);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }
}
