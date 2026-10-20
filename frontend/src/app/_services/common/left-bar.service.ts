import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LeftMenuService {
  private leftBarSub = new BehaviorSubject<boolean>(false);
  Isleftbar = this.leftBarSub.asObservable();

  private sidebarCollapsedSource = new BehaviorSubject<boolean>(false);
  sidebarCollapsed$ = this.sidebarCollapsedSource.asObservable();
  constructor() { }


  public toggleSidebar() {
    this.leftBarSub.next(!this.leftBarSub.value);
  }

  setSidebarCollapsed(value: boolean) {
    this.sidebarCollapsedSource.next(value);
  }



}