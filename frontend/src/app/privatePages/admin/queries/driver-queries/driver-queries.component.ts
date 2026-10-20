import { Component, OnInit } from '@angular/core';
import { lookupData } from '../../../../core/modals';
import { LookupService } from '../../../../_services/dataServices/lookup.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { QueriesService } from '../../../../_services/dataServices/queries.service';
import { changeDateToApiFormat } from '../../../../core/utility';
import { ImportModule } from '../../../../core/import/import.module';
import { DatePickerComponent } from '../../../../core/date-picker/date-picker.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../../_services/common/auth.service';

@Component({
  selector: 'app-driver-queries',
  standalone: true,
  imports: [ImportModule, DatePickerComponent],
  templateUrl: './driver-queries.component.html',
  styleUrl: './driver-queries.component.scss'
})
export class DriverQueriesComponent implements OnInit {
  selectRequirements: lookupData[] = [];
  selectedRequirements: string[] = [];
  form!: FormGroup;
  profileId!: string;
  showFields: boolean = false;
  constructor(
    private lookupService: LookupService,
    private formBuilder: FormBuilder,
    private queriesService: QueriesService,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.formBuilder.group({
      queryDate: [''],
      notes: [''],
      isAnonymous: [false],
    });
    this.profileId = this.authService.userDetails?.profileId ?? '';
    this.getRequirementsLookup();
  }

  ngOnInit(): void {

  }

  setBooleanValue(field: string, value: string | boolean) {
    this.form.patchValue({ [field]: value });
  }

  getRequirementsLookup() {
    const sub = this.lookupService.getSettingsLookup('ClearanceTypes').subscribe({
      next: (res) => {
        this.selectRequirements = res.data;
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  onChange(req: any, checked: boolean) {
    if (req.name == 'Something Else') {
      if (checked) {
        this.showFields = true;
      } else {
        this.showFields = false;
      }


    }
    if (checked) {
      this.selectedRequirements = this.selectedRequirements || []
      this.selectedRequirements.push(req.value);
    } else {
      this.selectedRequirements = this.selectedRequirements?.filter((a: any) => a !== req.value);
    }
  }

  shouldDisable(item: any): boolean {
    const selected = this.selectedRequirements;

    const somethingElseItem = this.selectRequirements.find(
      x => x.name === 'Something Else'
    );

    const somethingElseSelected = selected.includes(somethingElseItem?.value ?? '');

    const anyOtherSelected = selected.some(
      x => x !== somethingElseItem?.value
    );

    if (somethingElseSelected) {
      return item.value !== somethingElseItem?.value;
    }

    if (anyOtherSelected) {
      return item.value === somethingElseItem?.value;
    }

    return false;
  }

  submit() {
    if (this.form.valid) {
      const data = Object.assign({}, this.form.value);
      data.queryDate = changeDateToApiFormat(data?.queryDate);
      data.profileId = this.profileId ?? '';
      data.type = this.selectedRequirements ?? [];

      const sub = this.queriesService.
        createOrUpdateDriverQueries(data)
        .subscribe({
          next: (res: any) => {
            this.router.navigate(
              ['/queries'],
            );

            sub.unsubscribe();
          },
          error: (res) => {
            sub.unsubscribe();
          },
        });
    }
  }

}

