import { Component, OnDestroy, OnInit } from '@angular/core';
import { Candidates } from '../../../../core/modals';
import { Pagination } from '../../../../core/modals/pagination';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PaginationService } from '../../../../_services/common/pagination.service';
import { ImportModule } from '../../../../core/import/import.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationComponent } from '../../../../core/pagination/pagination.component';
import { BadgeColorService } from '../../../../_services/common/badgeColor.service';
import { RecruitmentsService } from '../../../../_services/dataServices/recruitments.service';
import { MatDialog } from '@angular/material/dialog';
import { NewEquipmentComponent } from './new-equipment/new-equipment.component';
import { GenerateAodComponent } from './generate-aod/generate-aod.component';
import moment from 'moment';
@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.scss'
})
export class EquipmentComponent implements OnInit, OnDestroy {
  dataSource: Candidates[] = [];
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  recruitmentId!: string;
  params: Params = {};
  routSub!: Subscription;
  moment = moment;
  constructor(
    private recruitmentService: RecruitmentsService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    public badgeColorService: BadgeColorService,
  ) {
    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.recruitmentId = params['id'];
    });

    this.qSub = this.route.queryParams.subscribe((res) => {
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


  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getAllEquipments() {
    const params = Object.assign({}, this.queryParams);
    params['recruitment_id'] = this.recruitmentId;
    const sub = this.recruitmentService
      .getAllEquipments(params)
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


  sort(field: string, order: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderby: field, orderdir: order },
      queryParamsHandling: 'merge',
    });
  }

  newEquipmentPopup(name: string, phoneNumber: string, profileId: string, equipmentId: string = '') {
    const DialogRef = this.dialog.open(NewEquipmentComponent, {
      data: { name: name, phoneNumber: phoneNumber, profileId: profileId, recruitmentId: this.recruitmentId, equipmentId: equipmentId },
      minWidth: '390px',
      maxWidth: '90vw',
      width: '700px',
      height: 'auto',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllEquipments();
      sub.unsubscribe();
    });
  }

  generateAod(profileId: string = '') {
    const DialogRef = this.dialog.open(GenerateAodComponent, {
      data: { profileId: profileId },
      minWidth: '390px',
      maxWidth: '90vw',
      width: '900px',
      height: 'auto',
      minHeight: '50vh',
      maxHeight: '90vh',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllEquipments();
      sub.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    this.routSub.unsubscribe();
    this.qSub.unsubscribe();
  }
}
