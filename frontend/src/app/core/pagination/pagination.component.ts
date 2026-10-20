import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Router, Params } from '@angular/router';
import { Pagination } from '../modals/pagination';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'pagination',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule , MatIcon],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent implements OnChanges{
  @Input() params: Params | any;
	@Input() pager: Pagination | any;
	@Input() cardBox: Boolean = true;
	@Input() page_n: string = 'page';
	queryParams: Params | any;
	page_size = "25";
	
	constructor(private router: Router) {
		
	}
	ngOnChanges(changes: SimpleChanges) {
		const change = changes['params'];
		if (change && change.currentValue) {
			this.queryParams = Object.assign({}, this.params)
		}
	}
	ngOnInit() {
		this.queryParams = Object.assign({}, this.params)
		if (this.queryParams['page_size']) {
			this.page_size = this.queryParams['page_size'];
		}
	}
	changePage(page:any, p = 0) {
		if (parseInt(page) + p > 0 && parseInt(page) + p <= this.lastPage()) {
			this.queryParams[this.page_n] = parseInt(page) + p
			this.changeRoute();
		}
	}
	changePageSize(page_size:any) {
		this.queryParams[this.page_n] = 1
		this.queryParams['page_size'] = parseInt(page_size)
		this.changeRoute();
	}
	lastPage() {
		return parseInt(this.pager.total.toString()) ? Math.ceil(parseInt(this.pager.total.toString()) / parseInt(this.pager.page_size.toString())) : 0;
	}
	changeRoute() {
		this.router.navigate([], { queryParams: this.queryParams });
	}
}
