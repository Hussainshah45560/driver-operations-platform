import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImportModule } from '../../../../core/import/import.module';
import { References } from '../../../../core/modals';

@Component({
  selector: 'app-reference',
  standalone: true,
  imports: [ImportModule],
  templateUrl: './reference.component.html',
  styleUrl: './reference.component.scss'
})
export class ReferenceComponent implements OnInit {
  references!: References[];

  constructor(
    @Optional() private dialogRef: MatDialogRef<ReferenceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data.ref) {
      this.references = this.data.ref;
    }
  }

  ngOnInit(): void {
  }



  close() {
    this.dialogRef.close();
  }


}