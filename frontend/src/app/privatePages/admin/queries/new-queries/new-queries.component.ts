import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ImportModule } from '../../../../core/import/import.module';
import { BadgeColorService } from '../../../../_services/common/badgeColor.service';
import { LbAutoCompleteComponent } from '../../../../core/lb-auto-complete/lb-auto-complete.component';
import { CandidateInfo, lookupData, Queries } from '../../../../core/modals';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { ActivatedRoute, Router } from '@angular/router';
import { QueriesService } from '../../../../_services/dataServices/queries.service';
import { Subscription } from 'rxjs';
import { LookupService } from '../../../../_services/dataServices/lookup.service';

@Component({
  selector: 'app-new-queries',
  standalone: true,
  imports: [ImportModule, LbAutoCompleteComponent, VMessageComponent],
  templateUrl: './new-queries.component.html',
  styleUrl: './new-queries.component.scss',
})
export class NewQueriesComponent implements OnInit {
  form!: FormGroup;
  selectAdmin: lookupData[] = [];
  selectStatus: lookupData[] = [{ name: 'In Progress', value: 'in progress' }, { name: 'Completed', value: 'completed' }]
  pSub: Subscription | undefined;
  qSub: Subscription | undefined;
  queryId: string = '';
  profileId: string = '';
  dataSource!: Queries['type'];
  candidateInfo!: CandidateInfo;
  payload: { _id: string; status: string }[] = [];
  constructor(
    public badgeColorService: BadgeColorService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private queriesService: QueriesService,
    private lookupService: LookupService
  ) {
    this.form = this.formBuilder.group({
      assignedTo: [''],
      status: [''],
      approved: [''],
      notes: [''],
      type: this.formBuilder.array([])
    });
    this.getAdminLookup();
  }

  ngOnInit(): void {
    // Route params
    this.pSub = this.route.paramMap.subscribe(params => {
      this.queryId = params.get('queryId') ?? '';
    });
    if (this.queryId != '') {
      this.getSingleQuery();
    }
    // Query params
    this.qSub = this.route.queryParamMap.subscribe(query => {
      this.profileId = query.get('profileId') ?? '';
    });
    if (this.profileId != null) {
      this.getCandidateInfo();
    }
  }

  get type(): FormArray {
    return this.form.get('type') as FormArray;
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getAdminLookup(q: string = '') {
    let p: any = { q };
    const sub = this.lookupService.getSettingsLookup('Admins', p).subscribe({
      next: (res) => {
        this.selectAdmin = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  setBooleanValue(field: string, value: string | boolean) {
    this.form.patchValue({ [field]: value });
  }

  getSingleQuery() {
    const sub = this.queriesService.getSingleQuery(this.queryId).subscribe({
      next: (res) => {
        this.dataSource = res.data.type;
        this.form.patchValue({
          assignedTo: res.data.assignedTo ?? '',
          approved: res.data?.approved ?? '',
          notes: res.data?.notes ?? '',
        });
        this.dataSource.forEach(item => {
          this.payload.push({
            _id: item._id,
            status: item.status
          });
          this.type.push(
            this.formBuilder.group({
              status: [item.status]
            })
          );
        });

      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  updateStatus(id: string, newStatus: string) {
    const index = this.payload.findIndex(item => item._id === id);

    if (index > -1) {
      this.payload[index].status = newStatus;
    } else {
      this.payload.push({ _id: id, status: newStatus });
    }
  }


  getCandidateInfo() {
    const sub = this.queriesService
      .getCandidateInfo({ profile_id: this.profileId })
      .subscribe({
        next: (res) => {
          this.candidateInfo = res.data;
          this.form.patchValue({
            customer: this.candidateInfo?.customerName ?? '',
            site: this.candidateInfo?.site ?? '',
            jobTitle: this.candidateInfo?.jobTitle ?? '',
            startDate: this.candidateInfo?.startDate ?? '',
            endDate: this.candidateInfo?.endDate ?? '',
          });
          this.form.get('startDate')?.disable();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  goBack() {
    this.router.navigate(['/queries']);
  }
  submit() {
    const data = Object.assign({});
    data.profileId = this.profileId;
    data.approved = this.form.value.approved;
    data.assignedTo = this.form.value.assignedTo;
    data.type = this.payload ?? [];
    const sub = this.queriesService
      .createOrUpdateQueries(data, this.queryId)
      .subscribe({
        next: (res) => {
          this.router.navigate(['queries']);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }
}
