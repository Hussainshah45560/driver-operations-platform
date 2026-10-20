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
import moment from 'moment';
import { CandidateDetailsComponent } from '../candidate-details/candidate-details.component';
import { MatDialog } from '@angular/material/dialog';
import { GenerateContractComponent } from '../generate-contract/generate-contract.component';
@Component({
  selector: 'app-finalisation',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './finalisation.component.html',
  styleUrl: './finalisation.component.scss'
})
export class FinalisationComponent implements OnInit, OnDestroy {
  dataSource: Candidates[] = [];
  id!: string;
  pager: Pagination | any;
  qSub: Subscription;
  queryParams: Params = {};
  searchForm: FormGroup;
  recruitmentId!: string;
  params: Params = {};
  routSub!: Subscription;
  moment = moment;
  isInductionRequired: boolean = false;
  constructor(
    private recruitmentService: RecruitmentsService,

    private pagination: PaginationService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    public badgeColorService: BadgeColorService,
  ) {
    this.qSub = this.route.queryParams.subscribe((res) => {
      if (res && Object.keys(res).length > 0) {
        Object.assign(this.queryParams, res);
        this.getAllFinalised();
      }
    });
    this.searchForm = this.formBuilder.group({
      searchTerm: ['']
    })
  }
  ngOnInit(): void {
    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.recruitmentId = params['id'];
      if (this.recruitmentId) {
        this.getAllFinalised();
      }
    });
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

  getAllFinalised() {
    const params = Object.assign({}, this.queryParams);
    params['recruitment_id'] = this.recruitmentId;
    const sub = this.recruitmentService
      .getAllFinalised(params)
      .subscribe({
        next: (res) => {
          this.isInductionRequired = res.data.isInductionRequired ?? false;
          this.dataSource = res.data.result;
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

  candidateDetails(id: string, purpose: string) {

    const DialogRef = this.dialog.open(CandidateDetailsComponent, {
      data: { id: id, purpose: purpose },
      minWidth: '390px',
      maxWidth: '90vw',
      width: '69vw',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllFinalised();
      sub.unsubscribe();
    });
  }

  generateContract(id: string , userId:string) {
    const DialogRef = this.dialog.open(GenerateContractComponent, {
      data: { id: id, recruitmentId: this.recruitmentId ,userId:userId},
      minWidth: '390px',
      maxWidth: '90vw',
      width: '69vw',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllFinalised();
      sub.unsubscribe();
    });
  }


  ngOnDestroy(): void {
    this.qSub.unsubscribe();
  }
}
