import { Component, OnDestroy, OnInit } from '@angular/core';
import { SettingData } from '../../../../core/modals';
import { Pagination } from '../../../../core/modals/pagination';
import { filter, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MessageService } from '../../../../_services/common/message.service';
import { PaginationService } from '../../../../_services/common/pagination.service';
import { MatDialog } from '@angular/material/dialog';
import { ImportModule } from '../../../../core/import/import.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationComponent } from '../../../../core/pagination/pagination.component';
import { EquipmentsService } from '../../../../_services/dataServices/equipments.service';
import { NewEquipmentComponent } from './new-equipment/new-equipment.component';

@Component({
  selector: 'app-equipments',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './equipments.component.html',
  styleUrl: './equipments.component.scss'
})
export class EquipmentsComponent implements OnInit, OnDestroy {
  dataSource: SettingData[] = [];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  constructor(
    private equipmentsService: EquipmentsService,
    private messageService: MessageService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.qSub = this.route.queryParams.subscribe(res => {
      Object.assign(this.queryParams, res);
      this.getAllEquipments();
    });
    this.searchForm = this.formBuilder.group({
      searchTerm: ['']
    })
  }
  ngOnInit(): void {

  }

  search(searchTerm: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: searchTerm },
      queryParamsHandling: 'merge',
    });
  }

  getAllEquipments() {
    const sub = this.equipmentsService.getAllEquipments(this.queryParams).subscribe({
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
    const DialogRef = this.dialog.open(NewEquipmentComponent, {
      data: { id: id },
      width: '80%',
      height: isMobile ? '70%' : '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllEquipments();
      sub.unsubscribe();
    });

  }

  deleteEquipments(id: string) {
    const isub = this.messageService
      .prompt(`Confirm Deletion`, 'Are you sure you want to delete this equipment?')
      .afterClosed()
      .pipe(
        filter((_confirmed: boolean) => _confirmed),
        switchMap(() => {
          return this.equipmentsService.deleteEquipments(id);
        })
      )
      .subscribe({
        next: (res) => {
          this.getAllEquipments();
          isub.unsubscribe();
        },
        error: (res) => {
          isub.unsubscribe();
        },
      });
  }

  sort(field: string, order: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderby: field, orderdir: order },
      queryParamsHandling: 'merge',
    });
  }

  ngOnDestroy(): void {
    this.qSub.unsubscribe();
  }
}
