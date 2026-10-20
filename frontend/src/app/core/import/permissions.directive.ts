/* tslint:disable:member-ordering */
import { Directive, ElementRef, Input, OnChanges } from '@angular/core';
import { PermissionService } from '../../_services/common/permission.service';

@Directive({
  selector: '[Permission]'
})
export class PermissionsDirective implements OnChanges{
  @Input('Permission') permission: string = '';

  constructor(private el: ElementRef, private _p: PermissionService) {
  }
  ngOnChanges() {
    this.checkPermission();
  }

  private checkPermission() {
    const p = this.permission.split(':');
    if (!this._p.havePerm(p[0], p[1])) {
      this.el.nativeElement.classList.add("d-none");
      this.el.nativeElement.remove();
    }
  }
}