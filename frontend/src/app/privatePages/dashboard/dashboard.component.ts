import { Component } from '@angular/core';
import { ImportModule } from '../../core/import/import.module';
import { AuthService } from '../../_services/common/auth.service';
import { Observable } from 'rxjs';
import { User } from '../../core/modals';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ImportModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  user$: Observable<User | null>;
  constructor(
      private _auth: AuthService
    ) {
      this.user$ = this._auth.userInfo;
    }
}
