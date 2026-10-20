import { Injectable } from "@angular/core";
import { Sort } from "@angular/material/sort";

@Injectable({
	providedIn: 'root'
})
export class SortService {
	constructor() { }

	public getSortedData(sort: Sort, col: string[], data: any) {
		const sortedData = data?.slice();
		if (!sort.active || sort.direction === '') {
			return sortedData;
		}

		return sortedData.sort((a:any, b:any ) => {
			const isAsc = sort.direction === 'asc';
			
			if (col.indexOf(sort.active) > -1) {
				const col = sort.active;
				return this.compare(typeof(a[col]) == 'string' ? a[col].toLowerCase():a[col], typeof(b[col]) == 'string' ? b[col].toLowerCase():b[col], isAsc);
			}
			return 0;
			
		});
	}

	private compare(a: number | string, b: number | string, isAsc: boolean) {
		
		a = (a === null || a==='')? '' : a;
		b = (b === null || b === '') ? '' : b;
		return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
	}
}