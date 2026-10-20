import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [],
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss'
})
export class SuccessComponent implements OnInit {
  isAdmin: boolean = false;
  constructor(private router: Router) {

  }
  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    this.isAdmin = nav?.extras?.state?.['isAdmin'];
  }
  goTo(page: string) {
    this.router.navigate([`/${page}`], { queryParams: { isAdmin: this.isAdmin, } })
  }
}
