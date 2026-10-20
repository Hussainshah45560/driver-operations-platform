import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImportModule } from '../import/import.module';

@Component({
  selector: 'app-prompt',
  standalone: true,
  imports: [ImportModule],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.scss'
})
export class PromptComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<PromptComponent>) { }

  public ngOnInit() {
    // TODO: Merge these params
    this.data.message = this.data.message || this.data.text;
    this.data.purpose = this.data.purpose ?? '';
    // this.data.confirmation = this.data.confirmation
    this.data.acceptBtnText = this.data.acceptBtnText || this.data.successBtnText;
    this.data.rejectBtnText = this.data.rejectBtnText || this.data.closeBtnText;
  }

}
