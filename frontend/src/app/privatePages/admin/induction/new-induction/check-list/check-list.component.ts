import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../../../core/import/import.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CandidateStateService } from '../../../../../_services/common/candidate-state.service';
import { InductionService } from '../../../../../_services/dataServices/induction.service';
import { Checklist } from '../../../../../core/modals';
import { Subscription } from 'rxjs';
import { PermissionService } from '../../../../../_services/common/permission.service';

@Component({
  selector: 'app-check-list',
  standalone: true,
  imports: [ImportModule],
  templateUrl: './check-list.component.html',
  styleUrl: './check-list.component.scss',
})
export class CheckListComponent implements OnInit, OnDestroy {
  form!: FormGroup
  customerId!: string;
  dataSource!: Checklist[];
  id!: string;
  params: Params = {};
  sub: Subscription | undefined;
  qSub: Subscription | undefined;
  selectedIds: string[] = [];
  inductionId!: string;
  driverTesing: boolean = true;
  recruitmentId!: string;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private candidateStateService: CandidateStateService,
    private inductionService: InductionService,
    private route: ActivatedRoute,
    private psService: PermissionService
  ) {
    this.sub = this.route.parent?.params.subscribe(params => {
      this.params = params;
      this.id = params['applicationId'];
    });
    this.form = this.formBuilder.group({
      checklist: ['']
    });

    this.qSub = this.route.queryParams.subscribe(qParams => {
      this.inductionId = qParams['inductionId'];
    });

    if (this.inductionId) {
      this.getChecklistStep();
    }

  }

  ngOnInit(): void {
    this.candidateStateService.candidateData$.subscribe(data => {
      this.customerId = data?.customerId;
      this.recruitmentId = data?.recruitmentId;
      if (this.customerId) {
        this.getCustomerCheckList(this.customerId);
      }
    });

  }

  goBack() {
    this.router.navigate(['induction']);
  }

  getChecklistStep() {
    const sub = this.inductionService
      .getChecklistStep(this.inductionId)
      .subscribe({
        next: (res) => {
          this.selectedIds = res.data.checklistIds ?? [];
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  toggleSelection(id: string, checked: boolean) {
    if (checked) {
      // Add selected ID
      this.selectedIds.push(id);
    } else {
      // Remove ID when unchecked
      this.selectedIds = this.selectedIds.filter(x => x !== id);
    }
  }

  getCustomerCheckList(id: string) {
    const sub = this.inductionService
      .getCustomerCheckList({ customer_id: id, type: 'checklistRequired' })
      .subscribe({
        next: (res) => {
          this.dataSource = res.data?.checklists;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  submit() {
    if (this.selectedIds.length > 0) {
      const data = Object.assign({});
      data.checklistIds = this.selectedIds;
      data.applicationId = this.id;
      data.recruitmentId = this.recruitmentId;
      if (this.inductionId != '' && this.inductionId != undefined) {
        const sub = this.inductionService
          .saveAndUpdateCheckListStep(data, this.inductionId)
          .subscribe({
            next: (res: any) => {
              if (this.driverTesing == this.psService.havePerm('induction', 'driver Testing')) {
                this.router.navigate(
                  ['/induction', this.id, 'driver-testing'],
                  {
                    queryParams: { inductionId: this.inductionId }
                  }
                );
              } else {
                this.router.navigate(
                  ['/induction', this.id, 'vehicle-testing'],
                  {
                    queryParams: { inductionId: this.inductionId }
                  }
                );
              }
              this.router.navigate(
                ['/induction', this.id, 'driver-testing'],
                {
                  queryParams: { inductionId: this.inductionId }
                }
              );
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {
        const sub = this.inductionService
          .saveAndUpdateCheckListStep(data)
          .subscribe({
            next: (res: any) => {
              this.psService.havePerm('induction', 'driver Testing')
              this.router.navigate(
                ['/induction', this.id, 'driver-testing'],
                {
                  queryParams: { inductionId: res.data?.inductionId }
                }
              );
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      }


    }

  };

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.qSub?.unsubscribe();
  }
}
