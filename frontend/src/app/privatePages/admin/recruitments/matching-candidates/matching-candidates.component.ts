import { Component, OnInit } from '@angular/core';
import { ImportModule } from '../../../../core/import/import.module';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RecruitmentsService } from '../../../../_services/dataServices/recruitments.service';
import { Recruitment } from '../../../../core/modals';
import { MatDialog } from '@angular/material/dialog';
import { ViewRequestComponent } from '../view-request/view-request.component';
import { Pagination } from '../../../../core/modals/pagination';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationComponent } from '../../../../core/pagination/pagination.component';
import { CandidatesComponent } from '../candidates/candidates.component';
import { ShortListComponent } from '../short-list/short-list.component';
import { FinalisationComponent } from '../finalisation/finalisation.component';
import { EquipmentComponent } from '../equipment/equipment.component';
import { CandidateStateService } from '../../../../_services/common/candidate-state.service';

@Component({
  selector: 'app-matching-candidates',
  standalone: true,
  imports: [ImportModule, PaginationComponent, CandidatesComponent, ShortListComponent, FinalisationComponent, EquipmentComponent],
  templateUrl: './matching-candidates.component.html',
  styleUrl: './matching-candidates.component.scss'
})
export class MatchingCandidatesComponent implements OnInit {
  params: Params = {};
  routSub!: Subscription;
  id!: string;
  customerInfo!: Recruitment;
  dataSource: Recruitment[] = [];
  pager: Pagination | any;
  searchForm: FormGroup;
  activeTabIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private recruitmentService: RecruitmentsService,
    private router: Router,
    private formBuilder: FormBuilder,
    private candidateStateService: CandidateStateService
  ) {
    this.searchForm = this.formBuilder.group({
      searchTerm: [''],
    });

  }

  ngOnInit(): void {
    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getCustomerInfo(this.id);
      }
    });
  }

  onTabChange(event: any) {
    this.activeTabIndex = event.index;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},  // clear all query params immediately
      queryParamsHandling: null, // make sure we don't merge
      replaceUrl: true
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

  getCustomerInfo(id: string) {
    const sub = this.recruitmentService
      .getAllRecruitments({ recruitment_id: id })
      .subscribe({
        next: (res) => {
          this.customerInfo = res.data[0];
          this.candidateStateService.setcandidateData({
            customerId: this.customerInfo?.customerId ?? ''
          });
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }


  viewRequest() {
    const DialogRef = this.dialog.open(ViewRequestComponent, {
      data: { id: this.id },
      maxWidth: '100%',
      minWidth: '300px',
      height: '70%',
      disableClose: true,
      panelClass: 'custom-dialog-radius'
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      sub.unsubscribe();
    });
  }

}
