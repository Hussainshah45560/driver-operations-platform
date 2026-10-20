import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NewRecruitmentComponent } from '../new-recruitment/new-recruitment.component';

@Component({
  selector: 'app-view-request',
  standalone: true,
  imports: [NewRecruitmentComponent],
  templateUrl: './view-request.component.html',
  styleUrl: './view-request.component.scss'
})
export class ViewRequestComponent {
  recruitmentId!: string;
  constructor(
    @Optional() private dialogRef: MatDialogRef<ViewRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data.id) {
      this.recruitmentId = this.data.id;
    }
  }


  close() {
    this.dialogRef.close();
  }
}
