import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ValidatorMessageService } from '../validator-message.service';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'vmessage',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './v-message.component.html',
  styleUrl: './v-message.component.scss'
})
export class VMessageComponent {
  @Input() field: string | null = null;
	@Input() form: FormGroup | null = null;
	@Input() control: any | FormControl = '';
	constructor(private vms: ValidatorMessageService) {
	}
	get errorMessage() {
		for (let propertyName in this.fromControl.errors) {
			if (this.fromControl.errors.hasOwnProperty(propertyName) && this.fromControl.touched) {
				let pname: string | null = propertyName;
				if (propertyName == 'pattern') {
					pname = this.field;
				}
				return this.vms.getValidatorErrorMessage(pname, this.fromControl.errors[propertyName]);
			}
		}

		return null;
	}
	get fromControl(): FormControl {
		if (this.control instanceof FormControl) {
			return this.control;
		} else if (typeof this.control === 'string' && this.form instanceof FormGroup) {
			return this.form.controls[this.control] as FormControl;
		}
		return new FormControl();
	}

}
