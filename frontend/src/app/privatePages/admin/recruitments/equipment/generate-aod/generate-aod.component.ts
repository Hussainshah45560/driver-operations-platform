import { Component, Inject, Optional } from '@angular/core';
import { NewAodComponent } from '../../../aod/new-aod/new-aod.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-generate-aod',
  standalone: true,
  imports: [NewAodComponent,],
  templateUrl: './generate-aod.component.html',
  styleUrl: './generate-aod.component.scss'
})
export class GenerateAodComponent {
  profileId!: string;
  constructor(
    @Optional() private dialogRef: MatDialogRef<GenerateAodComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data.profileId) {
      this.profileId = this.data?.profileId;
    }
  }


  close() {
    this.dialogRef.close();
  }
}
