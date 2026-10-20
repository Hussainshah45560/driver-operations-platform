import { Component, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { TemplateService } from '../../../_services/dataServices/template.service';
import { DetailsComponent } from './details/details.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [ImportModule, DetailsComponent],
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.scss',
})
export class TemplatesComponent implements OnInit {
  dataSource: { _id: string, title: string, count: number }[] = [];
  constructor(
    private templateService: TemplateService,
    private router: Router
  ) {

    this.getAllTemplateCategories();
  }
  ngOnInit() { }

  getAllTemplateCategories() {
    const sub = this.templateService.getAllTemplateCategories().subscribe({
      next: (res) => {
        this.dataSource = res['data'];
        this.router.navigate([], {
          queryParams: { templateTypeId: res['data'][0]._id },
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
