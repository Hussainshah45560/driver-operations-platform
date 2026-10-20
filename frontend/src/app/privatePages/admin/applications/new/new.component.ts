import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../../core/import/import.module';
import {
  ActivatedRoute,
  NavigationEnd,
  Params,
  Router,
  RouterOutlet,
} from '@angular/router';
import { ApplicationsService } from '../../../../_services/dataServices/applications.service';
import { filter, Subscription } from 'rxjs';
import { BadgeColorService } from '../../../../_services/common/badgeColor.service';

@Component({
  selector: 'app-new',
  standalone: true,
  imports: [ImportModule, RouterOutlet],
  templateUrl: './new.component.html',
  styleUrl: './new.component.scss',
})
export class NewComponent implements OnInit, OnDestroy {
  sub: Subscription | undefined;
  routerSub: Subscription | undefined;
  steps!: any;
  currentStep!: string;
  params!: Params;
  id!: string | null;
  name!: string;
  isView: boolean = false;
  expandedApp: any = null;
  applicationSteps = [
    {
      stepNumber: 1,
      title: 'Personal Details',
      url: 'step1',
    },
    {
      stepNumber: 2,
      title: 'Contacts',
      url: 'step2',
    },
    {
      stepNumber: 3,
      title: 'Education',
      url: 'step3',
    },
    {
      stepNumber: 4,
      title: 'Work',
      url: 'step4',
    },
    {
      stepNumber: 5,
      title: 'Work Details',
      url: 'step5',
    },
    {
      stepNumber: 6,
      title: 'Assets',
      url: 'step6',
    },
    {
      stepNumber: 7,
      title: 'Security',
      url: 'step7',
    },
    {
      stepNumber: 8,
      title: 'Documents',
      url: 'step8',
    },
    {
      stepNumber: 9,
      title: 'POPIA & Consent',
      url: 'step9',
    },
  ];

  get filteredApplicationSteps(): { stepNumber: number; title: string; url: string }[] {
    if (this.steps?.applicationType === 'other') {
      return this.applicationSteps.filter((s) => s.url !== 'step6');
    }
    return this.applicationSteps;
  }

  constructor(
    private applicationsService: ApplicationsService,
    private route: ActivatedRoute,
    private router: Router,
    public badgeColorService: BadgeColorService
  ) {
    this.sub = this.route.params.subscribe((params) => {
      this.params = params;
      if (params['id'] != null) {
        this.getStepsStatus(this.params['id']);
      }
    });
  }

  ngOnInit() {
    this.updateStepAndId();
    this.sub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateStepAndId();
      });
  }
  updateStepAndId() {
    const segments = this.router.url.split('/').filter(Boolean);

    this.isView = segments.includes('view');

    if (segments.includes('new')) {
      this.id = null;
      this.currentStep = segments[segments.length - 1];
    } else if (segments.includes('edit')) {
      this.id = segments[segments.length - 2];
      this.currentStep = segments[segments.length - 1];
    } else if (segments.includes('view')) {
      this.id = segments[segments.length - 2];
      this.currentStep = segments[segments.length - 1]; // ✅ THIS LINE
    }

    if (this.id) {
      this.getStepsStatus(this.id);
    }
  }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }
  getStepsStatus(id: string) {
    const sub = this.applicationsService.getStepsStatus(id).subscribe({
      next: (res) => {
        this.steps = res.data;
        this.name = res.data.name;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }
  isStepDisabled(item: any): boolean {
    const allowedStatuses = [
      'completed',
      'approved',
      'changed',
      'in progress',
      'rejected',
      'not confirmed',
      'confirmed',
    ];
    const currentIndex = this.filteredApplicationSteps.findIndex(
      (s) => s.url === this.currentStep
    );
    const stepIndex = this.filteredApplicationSteps.findIndex(
      (s) => s.url === item.url
    );
    const isFutureStep = stepIndex > currentIndex;
    const isAllowed = allowedStatuses.includes(
      this.steps?.stepStatus[item.url]
    );
    if (this.steps?.stepStatus[item.url] == 'in progress') {
      return isFutureStep && isAllowed;
    }
    return isFutureStep && !isAllowed;
  }

  get currentStepTitle(): string {
    if (!this.filteredApplicationSteps || !this.currentStep) {
      return 'Select Step';
    }

    // Normalize both values to avoid mismatch
    const currentStepNormalized = this.currentStep.trim().toLowerCase();

    const found = this.filteredApplicationSteps.find(
      (s) => s.url.trim().toLowerCase() === currentStepNormalized
    );

    return found ? found.title : 'Select Step';
  }

  get currentStepInfo(): { number: number; title: string } {
    if (!this.applicationSteps || !this.currentStep) {
      return { number: 0, title: 'Select Step' };
    }

    const step = this.applicationSteps.find(
      (s) => s.url.toLowerCase() === this.currentStep.toLowerCase()
    );

    if (!step) {
      return { number: 0, title: 'Select Step' };
    }

    return {
      number: step.stepNumber,
      title: step.title,
    };
  }

  expandDropdown() {
    this.expandedApp = this.expandedApp === true ? null : true;
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
