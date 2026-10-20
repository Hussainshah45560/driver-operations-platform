import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ImportModule } from '../../../../core/import/import.module';
import { RolesService } from '../../../../_services/dataServices/roles.service';
import { Role } from '../../../../core/modals';
import { PermissionsService } from '../../../../_services/dataServices/permissions.service';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [ImportModule],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss',
})
export class PermissionsComponent implements OnInit, OnDestroy {
  id: string = '';
  form: FormGroup;
  routSub: Subscription;
  permissions: { [key: string]: { [key: string]: boolean } } = {};
  dataSource = {};
  data!: Role;
  constructor(
    private route: ActivatedRoute,
    private rolesService: RolesService,
    private formBuilder: FormBuilder,
    private permissionsService: PermissionsService
  ) {
    this.routSub = this.route.params.subscribe((params) => {
      this.id = params['id'] ?? '';
      this.getAllPermissions();
      if (this.id) {
        this.getSingleRole(this.id);
      }
    });

    this.form = this.formBuilder.group({
      permissions: [{}, [Validators.required]],
    });
  }
  ngOnInit(): void { }
  getSingleRole(id: string) {
    const sub = this.rolesService.getSingleRole(id).subscribe({
      next: (res) => {
        this.data = res['data'];
        this.permissions = res['data'].permissions;
        this.form.patchValue({
          permissions: this.data.permissions ? this.data.permissions : {},
        });
        sub.unsubscribe();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }
  getAllPermissions() {
    const sub = this.permissionsService.getAllPermissions({ code: 'perm' }).subscribe({
      next: (res) => {
        this.dataSource = res.data.value;
        sub.unsubscribe();
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  submit() {
    const data = this.form.value;
    data.name = this.data.name;
    data.priority = this.data.priority;
    const sub = this.rolesService
      .createOrUpdateRole(data, this.id)
      .subscribe({
        next: (res) => {
          this.getSingleRole(this.id);
          sub.unsubscribe();
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });


  }
  setPermission(component: string, permission: string, status: { checked: boolean }) {
    if (this.permissions[component] == undefined) {
      this.permissions[component] = {};
    }
    this.permissions[component][permission] = status.checked;
    this.form.patchValue({ permissions: this.permissions });
  }
  getKeys(ob: object): string[] {
    return Object.keys(ob);
  }
  ngOnDestroy(): void {
    this.routSub.unsubscribe();
  }
}
