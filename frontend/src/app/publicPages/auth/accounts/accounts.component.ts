import { Component, OnInit } from '@angular/core';
import { PublicPageService } from '../../../_services/dataServices/publicPage.service';
import { Router } from '@angular/router';
import { Page } from '../../../core/modals';
import { ImportModule } from '../../../core/import/import.module';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [ImportModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
})
export class AccountsComponent implements OnInit {
  dataSource: Page | undefined;
  isAdmin: boolean = false;
  description:any;
  constructor(
    private publicPageService: PublicPageService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.getLandingPages();
  }
  ngOnInit(): void { }

  getLandingPages() {
    const sub = this.publicPageService
      .getPublicPageByCode({ code: 'landing-page' })
      .subscribe({
        next: (res) => {
          this.dataSource = res.data;
          this.description = this.sanitizer.bypassSecurityTrustHtml(this.dataSource?.description);
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  goTo(page: string, role?: boolean) {
    this.router.navigate([`/${page}`], { queryParams: { isAdmin: role, } });
  }
}
