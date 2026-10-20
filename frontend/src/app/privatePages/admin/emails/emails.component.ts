import { Component, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { EmailTemplateService } from '../../../_services/dataServices/emailTemplate.service';
import { Router } from '@angular/router';
import { DetailsComponent } from './details/details.component';

@Component({
  selector: 'app-emails',
  standalone: true,
  imports: [ImportModule, DetailsComponent],
  templateUrl: './emails.component.html',
  styleUrl: './emails.component.scss',
})
export class EmailsComponent implements OnInit {
  dataSource: { _id: string, title: string, count: number }[] = [];
  constructor(
    private emailTemplateService: EmailTemplateService,
    private router: Router
  ) {

    this.getAllEmailCategories();
  }
  ngOnInit() { }

  getAllEmailCategories() {
    const sub = this.emailTemplateService.getAllEmailCategories().subscribe({
      next: (res) => {
        this.dataSource = res['data'];
        this.router.navigate([], {
          queryParams: { emailTypeId: res['data'][0]._id },
          queryParamsHandling: 'merge'
        })
        sub.unsubscribe();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

}