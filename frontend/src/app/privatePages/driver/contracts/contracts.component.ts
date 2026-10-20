import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { PaginationComponent } from '../../../core/pagination/pagination.component';
import { PaginationService } from '../../../_services/common/pagination.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BadgeColorService } from '../../../_services/common/badgeColor.service';
import { Pagination } from '../../../core/modals/pagination';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Contract } from '../../../core/modals';
import moment from 'moment';
import { ContractsService } from '../../../_services/dataServices/contracts.service';
import { FileSaverService } from '../../../_services/common/fileSaver.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [ImportModule, PaginationComponent],
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.scss',
})
export class ContractsComponent implements OnInit, OnDestroy {
  searchForm!: FormGroup;
  queryParams: Params = {};
  dataSource!: Contract[];
  pager: Pagination | any;
  moment = moment;
  qSub: Subscription;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private pagination: PaginationService,
    private contractsService: ContractsService,
    private badgeColorService: BadgeColorService,
    private fileSaverService: FileSaverService,
  ) {
    this.searchForm = this.formBuilder.group({
      searchTerm: [''],
    });
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      if (this.queryParams['q'] != null) {
        this.searchForm.patchValue({
          searchTerm: this.queryParams['q'],
        });
      }
      this.getAllContracts();
    });
  }
  ngOnInit(): void { }
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

  getAllContracts() {
    const sub = this.contractsService
      .getAllContracts(this.queryParams)
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

  downloadFile(id: string, dest: boolean = false) {
    const sub = this.contractsService.downloadContract(id, dest).subscribe({
      next: (res: any) => {
        if (dest) {
          window.open(res.data.url, '_blank');
        } else {
          this.fileSaverService.downloadFile(res.data.url, res.data.templateName);
        }

      },
      error: (res) => {
        sub.unsubscribe();
      },
    });

  }

  hireEmployee(id: string) {
    const data = Object.assign({});
    data.userSign = '';
    data.userSignDate = '';
    const sub = this.contractsService
      .saveSignedTemplate(data, id)
      .subscribe({
        next: (res) => {
          this.router.navigate(['home'])
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
