import { Component, OnDestroy, OnInit } from '@angular/core';
import { HomeService } from '../../../_services/dataServices/home.service';
import { Home } from '../../../core/modals';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';
import { ImportModule } from '../../../core/import/import.module';
import { PermissionService } from '../../../_services/common/permission.service';
import { AuthService } from '../../../_services/common/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ImportModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  dataSource!: Home;
  constructor(
    private homeService: HomeService,
    public badgeColorService: BadgeColorService,
    public ps: PermissionService,
    private authService: AuthService
  ) {

    this.getHomeData();
  }

  ngOnInit(): void { }

  getColors(status: string) {
    return this.badgeColorService.getBadgeColor(status);
  }

  getHomeData() {
    const sub = this.homeService.getHomeData({ role: this.authService?.userDetails?.role?.name }).subscribe({
      next: (res) => {
        this.dataSource = res.data;
        if (this.dataSource?.recruitmentId != null) {
          localStorage.setItem('_cookiesId', JSON.stringify(this.dataSource?.recruitmentId));
        }
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }


  ngOnDestroy(): void { }
}
