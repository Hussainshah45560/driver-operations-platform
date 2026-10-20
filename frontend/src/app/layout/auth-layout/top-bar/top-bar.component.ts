import { Component } from '@angular/core';
import { LeftMenuService } from '../../../_services/common/left-bar.service';
import { MatIcon } from '@angular/material/icon';
import { PermissionService } from '../../../_services/common/permission.service';
import { ImportModule } from '../../../core/import/import.module';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [MatIcon, ImportModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
})
export class TopBarComponent {
  constructor(
    private leftBarService: LeftMenuService,
    public ps: PermissionService,
  ) {}
  showMenu() {
    this.leftBarService.toggleSidebar();
  }
}
