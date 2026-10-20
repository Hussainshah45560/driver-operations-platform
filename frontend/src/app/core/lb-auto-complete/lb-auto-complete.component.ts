import { Component, OnInit, Input, EventEmitter, Output, ViewChild, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { VMessageComponent } from '../v-message/v-message.component';
import { ImportModule } from '../import/import.module';
import { MatFormFieldAppearance } from '@angular/material/form-field';

@Component({
	selector: 'lb-auto-complete',
	standalone: true,
	imports: [VMessageComponent, ImportModule],
	templateUrl: './lb-auto-complete.component.html',
	styleUrl: './lb-auto-complete.component.scss'
})
export class LbAutoCompleteComponent implements OnInit, OnChanges {
	@Input() selectPlaceholder = 'Search...';
	@Input() placeholder: string = '';
	@Input() label: string = '';
	@Input() options: Array<any> = [];
	@Input() defaultValues: Array<any> = [];
	@Input() disabled = false;
	@Input() disabledSelect = false;
	@Input() customRequired = false;
	@Input() display = 'name';
	@Input() value = 'value';
	@Input() changedValue: any;
	@Input() fControl!: FormControl;
	@Input() errorMsg = 'Field is required';
	@Input() showErrorMsg = true;
	@Input() multiple = false;
	@Input() clear = false;
	@Input() searchFunction: Function = this.filterItem;

	// New Options
	@Input() labelCount = 1;
	@Input() appearance: MatFormFieldAppearance = 'outline';

	@Output()
	selectionChange: EventEmitter<any> = new EventEmitter();
	@Output()
	search: EventEmitter<string> = new EventEmitter();
	@ViewChild('selectElem') selectElem!: { toggle: () => void; };

	filteredOptions: Array<any> = [];
	selectedValue: any = [];
	selectAllChecked = false;
	displayString = '';
	constructor() { }
	ngOnInit() {
		if (this.options) {
			this.filteredOptions = this.options;
		} else {
			this.options = [];
		}
		if (this.multiple === false && typeof (this.selectedValue) == "object") {
			this.selectedValue = '';
		}
	}
	ngOnChanges() {
		if (this.options) {
			this.filteredOptions = this.options;
		} else {
			this.options = [];
		}
		if (this.fControl.value) {
			this.selectedValue = this.fControl.value;
		}
		// if (this.changedValue) {
		// 	console.log('changedValue updated:', this.changedValue);
		// }
		if (this.disabledSelect && this.fControl) {
			this.fControl.disable({ emitEvent: false });
		}

	}
	toggleDropdown() {
		this.selectElem.toggle();
	}

	filterItem(value: any) {
		this.filteredOptions = this.options.filter(
			item => item[this.display] && item[this.value] && item[this.display].toLowerCase().indexOf(value.toLowerCase()) > -1
		);
		this.selectAllChecked = true;
		this.filteredOptions.forEach(item => {
			if (typeof this.selectedValue !== "number") {
				if (!this.selectedValue.includes(item[this.value])) {
					this.selectAllChecked = false;
				}
			} else {
				if (!this.selectedValue === item[this.value]) {
					this.selectAllChecked = false;
				}
			}
		});
		if (!this.filteredOptions.length) {
			this.selectAllChecked = false;
		}
	}

	hideOption(option: any) {
		return !(this.filteredOptions.indexOf(option) > -1);
	}

	// Returns plain strings array of filtered values
	getFilteredOptionsValues() {
		const filteredValues: any[] = [];
		this.filteredOptions.forEach(option => {
			filteredValues.push(option.value);
		});
		return filteredValues;
	}

	onDisplayString() {
		this.displayString = '';
		if (this.selectedValue) {
			if (this.multiple === true) {
				// Multi select display
				if (this.selectedValue.length) {
					this.displayString = this.options.filter(
						option => this.selectedValue.indexOf(option[this.value]) !== -1
					).map(e => e[this.display]).join(', ');
				}
			} else {
				// Single select display
				let displayOption = this.options.filter(
					option => option[this.value] === this.selectedValue
				);
				if (displayOption.length) {
					this.displayString = displayOption[0][this.display];
				}
			}
		}
		return this.displayString;
	}

	showChangedValues(value: any) {
		if (!value) return '';
		if (value && !value.includes(',')) {
			const found = this.options.find(option => option.value === value);
			return found?.name || '';
		}
		else {
			let arr = value.split(',');
			let names: any[] = [];
			if (arr.length > 0) {
				arr.forEach((x: any) => {
					const found = this.options.find(option => option.value === x);
					names.push(found?.name);
				})
				return names
			}
		}


	}
	onSelectionChange(val: any) {
		const filteredValues = this.getFilteredOptionsValues();
		let count = 0;
		if (this.multiple === true) {
			this.selectedValue.filter((item: any) => {
				if (filteredValues.includes(item)) {
					count++;
				}
			});
			this.selectAllChecked = count === this.filteredOptions.length;
		}
		this.selectedValue = val;
		this.selectionChange.emit(this.selectedValue);
	}

	searchEmit(q: string = '') {
		this.search.emit(q);
	}

	public trackByFn(index: any, item: { value: any; }) {
		return item.value;
	}


}
