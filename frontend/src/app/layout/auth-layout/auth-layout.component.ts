import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../_services/common/auth.service';
import { CommonModule } from '@angular/common';
import { LeftSideBarComponent } from './left-side-bar/left-side-bar.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { LeftMenuService } from '../../_services/common/left-bar.service';
import { filter, Subscription } from 'rxjs';
import { ScrollService } from '../../_services/common/scroll.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LeftSideBarComponent, TopBarComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  load = false;
  sidebarCollapsed = false;
  @ViewChild('scrollBar') scrollBar!: ElementRef<HTMLDivElement>;
  sidebarSub!: Subscription;
  navEndSub!: Subscription;
  constructor(
    private _auth: AuthService,
    private leftmenuService: LeftMenuService,
    private router: Router,
    private scrollService: ScrollService
  ) {
    this._auth.isLoggedIn;
  }
  ngOnInit(): void {
    this.sidebarSub = this.leftmenuService.sidebarCollapsed$.subscribe(value => {
      this.sidebarCollapsed = value;
    });

    this.navEndSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.scrollBar.nativeElement.scrollTop = 0;
      });
  }
  ngAfterViewInit() {
    if (this.scrollBar?.nativeElement) {
      this.scrollService.setContainer(this.scrollBar.nativeElement);
    } else {
      console.error('scrollBar element not found!');
    }
  }
  ngOnDestroy(): void {
    if (this.sidebarSub) {
      this.sidebarSub.unsubscribe();
    }
    if (this.navEndSub) {
      this.navEndSub.unsubscribe();
    }
  }
}
