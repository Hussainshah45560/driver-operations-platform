export function changeDateToApiFormat(date: any): any {
	if (date && date['_i']) {
		let temp = date['_i'];
		if (temp['year']) {
			return date.format('YYYY-MM-DD');
		}

	}
	return date;
}