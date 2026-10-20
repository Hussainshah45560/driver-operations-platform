import { Component } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { RouterOutlet } from '@angular/router';
import { AdminSettingsService } from '../../../_services/dataServices/adminSettings.service';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ImportModule, RouterOutlet],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  dataSource: any = [];
  constructor(private settingService: AdminSettingsService) {
    this.getAllSettings();
  }

  getAllSettings() {
    const sub = this.settingService.getAllSettings({code : 'admin_settings'}).subscribe({
      next: (res) => {
        this.dataSource = res['data'];
        sub.unsubscribe();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }
}