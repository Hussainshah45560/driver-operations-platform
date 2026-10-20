import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PromptComponent } from '../../core/prompt/prompt.component';



@Injectable({
	providedIn: 'root'
})
export class MessageService {

	constructor(public matDialog: MatDialog,) { }
	public prompt(message: string, confirmation: string = '', acceptBtnText: string = 'Delete', purpose: string = '', config: MatDialogConfig = {}) {
		config.data = (config.data) ? config.data : {};
		config.data.message = message;
		config.data.confirmation = confirmation;
		config.data.acceptBtnText = acceptBtnText;
		config.data.purpose = purpose;
		if (!config.width) {
			config.width = purpose != '' ? '45vh' : '40vh';
		}
		config.position = { top: '100px' }
		return this.matDialog.open(PromptComponent, config);
	}
}


