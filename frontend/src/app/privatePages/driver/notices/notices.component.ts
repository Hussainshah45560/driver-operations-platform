import { Component } from '@angular/core';
import { Pagination } from '../../../core/modals/pagination';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationService } from '../../../_services/common/pagination.service';
import { NoticesService } from '../../../_services/dataServices/notices.service';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';
import { AuthService } from '../../../_services/common/auth.service';
import moment from 'moment';
import { Notices } from '../../../core/modals';
import { FileSaverService } from '../../../_services/common/fileSaver.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './notices.component.html',
  styleUrl: './notices.component.scss',
})
export class NoticesComponent {
  dataSource!: Notices;
  moment = moment;
  pager: Pagination | any;
  queryParams: Params = {};
  searchForm: FormGroup;
  profileId: string = '';
  qSub: Subscription;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagination: PaginationService,
    private formBuilder: FormBuilder,
    private noticesService: NoticesService,
    public badgeColorService: BadgeColorService,
    private authService: AuthService,
    private fileSaverService: FileSaverService,
  ) {
    this.searchForm = this.formBuilder.group({
      searchTerm: [''],
    });
    this.profileId = this.authService.userDetails?.profileId ?? '';
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      if (this.queryParams['q'] != null) {
        this.searchForm.patchValue({
          searchTerm: this.queryParams['q'],
        });
      }
      if (this.profileId) {
        this.getAllNotices();
      }
    });
  }

  ngOnInit(): void {}

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

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getAllNotices() {
    const sub = this.noticesService
      .getAllNotices(this.queryParams, this.profileId)
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

  downloadFile(warningNumber: string, disciplinaryId: string) {
    const sub = this.noticesService
      .downloadContract({
        warning_number: warningNumber,
        disciplinary_id: disciplinaryId,
        download: true,
      })
      .subscribe({
        next: (res: any) => {
          this.fileSaverService.downloadFile(
            res.data.url,
            res.data.templateName,
          );
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  ngOnDestroy(): void {
    this.qSub.unsubscribe();
  }
}
