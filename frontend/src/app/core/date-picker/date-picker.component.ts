import { Component, Input, OnInit } from '@angular/core';
import { VMessageComponent } from '../v-message/v-message.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { FormControl } from '@angular/forms';
import { ImportModule } from '../import/import.module';
import moment from 'moment';
export const MY_FORMATS = {
	parse: {
		dateInput: 'DD-MM-YYYY',
	},
	display: {
		dateInput: 'dddd, LL',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};

@Component({
	selector: 'app-date-picker',
	standalone: true,
	imports: [VMessageComponent, ImportModule],
	templateUrl: './date-picker.component.html',
	styleUrl: './date-picker.component.scss',
	providers: [
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
		},

		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
	]
})
export class DatePickerComponent implements OnInit {
	@Input() fControl!: FormControl;
	@Input() public placeholderText: string = '';
	@Input() disabled: boolean = false;
	@Input() public startView: 'month' | 'year' | 'multi-year' = 'month';
	@Input() label: string = '';
	@Input() changedValue: any;
	constructor() {
	}
	ngOnInit() {
		if (!this.fControl.value) {    
			this.fControl.setValue(moment());
		}
	}
	closeDatePicker(eventData: any, picker?: any, isclose: boolean = false) {
		if (isclose) {
			picker.close();
		}
	}
	focusOpen(picker: any) {
		if (!(('ontouchstart' in window) || (navigator.maxTouchPoints > 0))) {
			picker.open();
		}
	}
}
