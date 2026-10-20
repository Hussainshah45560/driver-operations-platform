import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ImportModule } from '../import/import.module';
import { NgSignaturePadOptions, SignaturePadComponent } from '@almothafar/angular-signature-pad';
@Component({
  selector: 'app-sign',
  standalone: true,
  imports: [ImportModule],
  templateUrl: './sign.component.html',
  styleUrl: './sign.component.scss'
})
export class SignComponent implements OnInit, AfterViewInit {
  @ViewChild('signature')
  public signaturePad!: SignaturePadComponent;
  @Output() signature: EventEmitter<any> = new EventEmitter();
  @Input() viewSign !: string;
  @Input() disabled: boolean = false;
  public signaturePadOptions: NgSignaturePadOptions = {
    minWidth: 4,
    canvasWidth: 500,
    canvasHeight: 100
  };
  signUrl: any;
  constructor() { }

  ngOnInit(): void {
  }
  loadSignature(base64Image: string) {
    if (!this.signaturePad) return;

    // loads base64 image into signature pad
    this.signaturePad.fromDataURL(base64Image);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      // apply option
      // this.signaturePad.minWidth = 4;

      this.signaturePad.clear();
      if (this.disabled) {
        this.signaturePad.off()
      }
      if (this.viewSign) {
        this.signaturePad.fromDataURL(this.viewSign);
      }
    }, 700);
  }

  drawComplete(event: MouseEvent | Touch) {
    this.signUrl = this.signaturePad.toDataURL();
    this.signature.emit(this.signUrl);
  }

  drawStart(event: MouseEvent | Touch) {
  }
  clear() {
    this.signaturePad.clear();
    this.signUrl = '';
    this.signature.emit(this.signUrl);
  }
}
