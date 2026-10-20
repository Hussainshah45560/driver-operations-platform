import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { BadgeColorService } from '../../../../_services/common/badgeColor.service';
import { filter, Subscription } from 'rxjs';
import { ImportModule } from '../../../../core/import/import.module';
import { DisciplinaryService } from '../../../../_services/dataServices/disciplinary.service';
import { CandidateInfo } from '../../../../core/modals';
import { CandidateStateService } from '../../../../_services/common/candidate-state.service';

@Component({
  selector: 'app-new-disciplinary',
  standalone: true,
  imports: [ImportModule, RouterOutlet],
  templateUrl: './new-disciplinary.component.html',
  styleUrl: './new-disciplinary.component.scss',
})
export class NewDisciplinaryComponent implements OnInit, OnDestroy {
  routerSub: Subscription | undefined;
  pSub: Subscription | undefined;
  qSub: Subscription | undefined;
  stepName!: string;
  disciplinarySteps = [
    {
      title: 'LOG REQUEST',
      url: 'log-request',
    },
    {
      title: 'SIGN',
      url: 'sign',
    },
    {
      title: 'HEARING',
      url: 'hearing',
    },
    {
      title: 'DISPUTE',
      url: 'dispute',
    },
    {
      title: 'AOD',
      url: 'aod',
    },
  ];
  currentStep!: string;
  isNewMode: boolean = false;
  isEditMode: boolean = false;
  disciplinaryId!: string;
  profileId!: string;
  candidateInfo!: CandidateInfo;
  enquiryType: string = '';
  expandedApp: any = null;
  applicationCategory!: string;
  constructor(
    private router: Router,
    private disciplinaryService: DisciplinaryService,
    public badgeColorService: BadgeColorService,
    private route: ActivatedRoute,
    private candidateStateService: CandidateStateService
  ) {
    this.updateStateFromUrl(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateStateFromUrl(event.urlAfterRedirects || event.url);
      });
  }

  ngOnInit(): void {
    // Route params
    this.pSub = this.route.paramMap.subscribe((params) => {
      this.disciplinaryId = params.get('disciplinaryId') ?? '';
      this.stepName = this.currentStep?.replace(/-/g, ' ') ?? '';
    });

    // Query params
    this.qSub = this.route.queryParamMap.subscribe((query) => {
      this.profileId = query.get('profileId') ?? '';
    });

    if (this.profileId != null) {
      this.getCandidateInfo();
    }
  }

  getCandidateInfo() {
    const sub = this.disciplinaryService
      .getCandidateInfo({
        profile_id: this.profileId,
        disciplinary_id: this.disciplinaryId ?? null,
      })
      .subscribe({
        next: (res) => {
          this.candidateInfo = res.data;
          this.applicationCategory = res.data?.applicationCategory;
          this.candidateStateService.setcandidateData({
            userId: res.data?.userId,
            hasDisciplinaryEnquiry: res.data?.hasDisciplinaryEnquiry,
            applicationCategory: res.data?.applicationCategory,
            customerId:res.data?.customerId
          });
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  updateStateFromUrl(url: string) {
    const segments = url.split('/').filter(Boolean);
    this.isNewMode = segments.includes('new');
    const lastSegment = segments[segments.length - 1];
    this.currentStep = lastSegment.split('?')[0];
    this.stepName = this.currentStep.replace(/-/g, ' ');
  }



  getRouterLink(stepUrl: string): any[] {
    if (this.isNewMode) {
      return ['/disciplinary', 'new', stepUrl];
    } else {
      return ['/disciplinary', this.disciplinaryId, stepUrl];
    }
  }

  isStepDisabled(stepIndex: number): boolean {
    const currentIndex = this.disciplinarySteps.findIndex(
      (step) => step.url === this.currentStep
    );
    // --- NEW MODE RULES ---
    if (this.isNewMode) {
      // Only step 0 enabled
      return stepIndex !== 0;
    }

    // --- NOT NEW MODE RULES ---

    // Step 0 and 1 must ALWAYS be enabled
    if (stepIndex === 0 || stepIndex === 1) {
      return false;
    }

    if (this.candidateInfo?.hasDisciplinaryEnquiry || this.applicationCategory == 'contractor') {
      return false;
    }

    // Disable only future steps
    return stepIndex > currentIndex;
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }
  expandDropdown() {
    this.expandedApp = this.expandedApp === true ? null : true;
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.qSub?.unsubscribe();
    this.pSub?.unsubscribe();
  }
}
