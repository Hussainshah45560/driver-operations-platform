/* tslint:disable:member-ordering */
import { Directive, ElementRef, Input, OnChanges } from '@angular/core';


@Directive({
  selector: '[Status]'
})
export class StatusDirective implements OnChanges{
  @Input('Status') status: string = '';

  constructor(private el: ElementRef) {
  }
  ngOnChanges() {
    this.checkPermission();
  }

  private checkPermission() {
    let classes: {[key:string]: string} = {
      'active': 'badge bg-success',
      'inactive': 'badge bg-warning',
      'deleted': 'badge bg-danger',
      'invited': 'badge bg-info',
    };
    // console.log(classes[this.status]);
    // console.log(this.el.nativeElement.classList.add('success'));
    this.el.nativeElement.classList.add(...classes[this.status].split(' '));
  }
}