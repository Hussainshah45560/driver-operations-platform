import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ImportModule } from '../../../../core/import/import.module';
import { BadgeColorService } from '../../../../_services/common/badgeColor.service';
import { InductionService } from '../../../../_services/dataServices/induction.service';
import { CandidateInfo } from '../../../../core/modals';
import { CandidateStateService } from '../../../../_services/common/candidate-state.service';
import { PermissionService } from '../../../../_services/common/permission.service';

@Component({
  selector: 'app-new-induction',
  standalone: true,
  imports: [ImportModule, RouterOutlet],
  templateUrl: './new-induction.component.html',
  styleUrl: './new-induction.component.scss',
})
export class NewInductionComponent implements OnInit, OnDestroy {
  routerSub: Subscription | undefined;
  stepName!: string;
  customerSteps: any[];
  currentStep!: string;
  customerId!: string;
  name!: string;
  candidateInfo!: CandidateInfo;
  inductionId!: string;
  expandedApp: any = null;
  recruitmentId!: string;
  constructor(
    private router: Router,
    private psService: PermissionService,
    private inductionService: InductionService,
    public badgeColorService: BadgeColorService,
    private candidateStateService: CandidateStateService
  ) {
    this.customerSteps = [
      {
        title: 'CANDIDATE DETAILS',
        url: 'candidate-details',
        display: true,
      },
      {
        title: 'CHECKLIST',
        url: 'checklist',
        display: true,
      },
      {
        title: 'DRIVER TESTING',
        url: 'driver-testing',
        display: this.psService.havePerm('induction', 'driver Testing'),
      },
      {
        title: 'VEHICLE TESTING',
        url: 'vehicle-testing',
        display: this.psService.havePerm('induction', 'vehicle Testing'),
      },
      {
        title: 'CONTRACT',
        url: 'contract',
        display: true,
      },
    ];

    this.updateStateFromUrl(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateStateFromUrl(event.urlAfterRedirects || event.url);
      });
  }

  ngOnInit(): void {
    const segments = this.router.url.split('/').filter(Boolean);
    this.customerId = segments[1] || '';
    if (this.customerId) {
      this.getCandidateInfo(this.customerId);
    }
  }

  updateStateFromUrl(url: string) {
    const segments = url.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    this.currentStep = lastSegment.split('?')[0];
    const queryString = lastSegment.split('?')[1] || null;

    if (queryString) {
      const params = new URLSearchParams(queryString);
      this.inductionId = params.get('inductionId') ?? '';
      this.recruitmentId = params.get('recruitmentId') ?? '';
    }
    this.stepName = this.currentStep.replace(/-/g, ' ');
  }

  getRouterLink(stepUrl: string): any[] {
    return ['/induction', this.customerId, stepUrl];
  }

  getCandidateInfo(id: string) {
    const sub = this.inductionService
      .getCandidateInfo({ application_id: id, recruitment_id: this.recruitmentId })
      .subscribe({
        next: (res) => {
          this.candidateInfo = res.data;
          this.candidateStateService.setcandidateData({
            customerId: res.data?.customerId,
            userId: res.data?.userId,
            recruitmentId: this.recruitmentId
          });
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }
  expandDropdown() {
    this.expandedApp = this.expandedApp === true ? null : true;
  }
  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}
