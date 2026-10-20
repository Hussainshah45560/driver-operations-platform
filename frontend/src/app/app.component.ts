import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImportModule } from './core/import/import.module';
import { LoadingService } from './_services/common/loading.service';
import { AsyncPipe, CommonModule, isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ImportModule, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'cmc-global';
  companies = {};
  load = false;
  loadApp: Observable<boolean>;
  constructor(
    private loading: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if(isPlatformBrowser(this.platformId)) {
      this.loading.appLoaded();
    }
    this.loadApp = this.loading.isBrowser;
  }
  ngOnInit(): void {
    this.loading.loading.subscribe(res => {
      // if (res) {
      // 	setTimeout(() => {
      // 		this.mode = 'indeterminate';
      // 	}, 50);
      // } else {
      // 	this.mode = 'buffer';
      // }
      if(res > 0) {
        this.load = true;
      } else {
        this.load = false;
      }
      // this.cdRef.detectChanges();
    });
  }
  // login(): void {
  //   const sub = this._auth.login('developer@loopbrackets.com', 'Test@123').subscribe({
  //     next: res => {
  //       sub.unsubscribe();
  //     },
  //     error: res => {
  //       sub.unsubscribe();
  //     }
  //   });
  // }
  // logout(): void {
  //   this._auth.logout()
  // }
}
