import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../_services/common/auth.service';
import { ImportModule } from '../../../core/import/import.module';
import { LeftMenuService } from '../../../_services/common/left-bar.service';
import { Navigation, User } from '../../../core/modals';
import { Observable, Subscription } from 'rxjs';
import { ApplicationsService } from '../../../_services/dataServices/applications.service';

@Component({
  selector: 'app-left-side-bar',
  standalone: true,
  imports: [ImportModule],
  templateUrl: './left-side-bar.component.html',
  styleUrl: './left-side-bar.component.scss'
})
export class LeftSideBarComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  topmenu: boolean = false;
  sideBarStatus: Observable<boolean>;
  companyName: string = '';
  userInfo: User | undefined;
  userSub: Subscription;
  activeUrl = "";
  userProfile!: string;
  isOpen: boolean = false;
  navigation: Navigation | undefined;
  constructor(
    private _authService: AuthService, private _leftMenuService: LeftMenuService,
    private router: Router,
    private applicationsService: ApplicationsService

  ) {
    this.activeUrl = this.router.url;
    this.sideBarStatus = this._leftMenuService.Isleftbar;
    this.userSub = this._authService.userInfo.subscribe(res => {
      if (res != null) {
        this.userInfo = res;
      }
    });

    this.getNavigationFromStorage();
    this.getLoggedInUserImage();
  }


  ngOnInit(): void {
  }

  getLoggedInUserImage() {
    const sub = this.applicationsService
      .getAllDocumentsByApplicationId({ user_id: this.userInfo?._id, type: "Selfie" })
      .subscribe({
        next: (res) => {
          this.userProfile = 'data:image/jpeg;base64,' + res.data[0]?.url;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });

  }

  logout() {
    this._authService.logout();
  }
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this._leftMenuService.setSidebarCollapsed(this.sidebarCollapsed);
  }
  toggleDiv() {
    this.isOpen = !this.isOpen;
  }
  closeMenu() {
    this._leftMenuService.toggleSidebar();
  }

  getNavigationFromStorage() {
    this.navigation = JSON.parse(localStorage.getItem('navigation') || '[]');
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
