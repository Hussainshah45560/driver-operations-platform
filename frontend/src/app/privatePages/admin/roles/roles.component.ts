import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImportModule } from '../../../core/import/import.module';
import { ActivatedRoute, Params, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { RolesService } from '../../../_services/dataServices/roles.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NewRoleComponent } from './new-role/new-role.component';
// import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [ImportModule, RouterOutlet],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
})
export class RolesComponent implements OnInit, OnDestroy {
  id: string = '';
  qSub: Subscription;
  queryParams: Params = {};
  permissions: { [key: string]: { [key: string]: boolean } } = {};
  dataSource: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rolesService: RolesService,
    private dialog: MatDialog
  ) {
    this.qSub = this.route.queryParams.subscribe((res) => {
      Object.assign(this.queryParams, res);
      this.getAllRoles();
    });

  }

  ngOnInit(): void { }

  getAllRoles() {
    const sub = this.rolesService.getAllRoles(this.queryParams).subscribe({
      next: (res) => {
        this.dataSource = res.data;
        this.router.navigate(['/permissions', this.dataSource[0]._id]);
        sub.unsubscribe();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }


  newDialog(id: string = '') {
    const isMobile = window.innerWidth < 768;
    const DialogRef = this.dialog.open(NewRoleComponent, {
      data: { id: id },
      width: '80%',
      height: isMobile ? 'auto' : '',
      disableClose: true,
    });
    const sub = DialogRef.afterClosed().subscribe((res) => {
      this.getAllRoles();
      sub.unsubscribe();
    });
  }
  ngOnDestroy(): void {
    this.qSub.unsubscribe();
  }
}
