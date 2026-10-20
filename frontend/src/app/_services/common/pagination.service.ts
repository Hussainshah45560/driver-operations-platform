import { Injectable } from '@angular/core';
import { Pagination } from '../../core/modals/pagination';



@Injectable({
	providedIn: 'root'
})
export class PaginationService {
	private total: number = 0;
	private end: number =25;
	private start: number =0;
	private page: number = 1;
	private page_size: number = 25;
	private sizeLimit: number = 25;
	constructor() { }

	compile(param : any): Pagination {
		this.total = param.total;
		const page_size = (parseInt(param.page_size)) ? (param.page_size > this.sizeLimit) ? this.sizeLimit : param.page_size : this.page_size * 1;
		const page = this.total ? (parseInt(param.page)) ? param.page : this.page * 1 : 0;
		this.end = page * page_size;
		if (this.end > this.total) {
			this.end = this.total;
		}
		if (page > 1) {
			this.start = ((page - 1) * page_size) + 1;
		} else {
			this.start = 1
		}
		// if (this.start < 0) {
		// 	this.start = 1;
		// }
		return {
			total: this.total,
			end: this.end,
			page: page,
			page_size: page_size,
			start: this.start
		};
	}
}
