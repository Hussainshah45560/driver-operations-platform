import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ImportModule } from '../../../../core/import/import.module';
import { CustomersService } from '../../../../_services/dataServices/customers.service';

@Component({
  selector: 'app-new-customer',
  standalone: true,
  imports: [ImportModule, RouterOutlet],
  templateUrl: './new-customer.component.html',
  styleUrl: './new-customer.component.scss',
})
export class NewCustomerComponent implements OnInit, OnDestroy {
  routerSub: Subscription | undefined;
  expandedApp: any = null;

  customerSteps = [
    {
      title: 'DETAILS',
      icon: '/assets/icons/details-icon',
      url: 'details',
    },
    {
      title: 'ADDRESS',
      icon: '/assets/icons/address-icon',
      url: 'address',
    },
    {
      title: 'CONTACTS',
      icon: '/assets/icons/contacts-icon',
      url: 'contacts',
    },
    {
      title: 'CONFIGURATION',
      icon: '/assets/icons/config-icon',
      url: 'configuration',
    },
  ];
  currentStep!: string;
  isNewMode: boolean = false;
  isEditMode: boolean = false;
  customerId!: string;
  tradingAs!: string;
  name!: string;
  constructor(
    private router: Router,
    private cutomerService: CustomersService
  ) {
    this.updateStateFromUrl(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateStateFromUrl(event.urlAfterRedirects || event.url);
      });
  }
  ngOnInit(): void {
    if (this.isEditMode) {
      this.getCustomerInfo(this.customerId);
    }
  }
  updateStateFromUrl(url: string) {
    const segments = url.split('/').filter(Boolean);
    this.isNewMode = segments.includes('new');
    this.isEditMode = segments.includes('edit');

    if (this.isEditMode) {
      const editIndex = segments.indexOf('edit');
      this.customerId = segments[editIndex + 1] || '';
      if (this.customerId) {
        this.getCustomerInfo(this.customerId);
      }
    } else {
      this.customerId = '';
    }

    this.currentStep = segments[segments.length - 1];
  }
  getRouterLink(stepUrl: string): any[] {
    if (this.isNewMode) {
      return ['/customers', 'new', stepUrl];
    } else if (this.isEditMode) {
      return ['/customers', 'edit', this.customerId, stepUrl];
    }
    return ['/customers', stepUrl];
  }

  isStepDisabled(stepUrl: string): boolean {
    if (this.isNewMode) {
      return stepUrl !== this.currentStep;
    }
    return false;
  }
  getCustomerInfo(id: string) {
    const sub = this.cutomerService.getCustomerInfo(id).subscribe({
      next: (res) => {
        this.tradingAs = res.data.tradingAs;
        this.name = res.data.name;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

get currentStepTitle(): string {
  if (!this.customerSteps || !this.currentStep) {
    return '';
  }

  const currentStepNormalized = this.currentStep.trim().toLowerCase();

  const found = this.customerSteps.find(
    s => s.url.trim().toLowerCase() === currentStepNormalized
  );

  return found ? found.title : '';
}


  expandDropdown() {
    this.expandedApp = this.expandedApp === true ? null : true;
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}
