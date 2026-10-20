import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ChecklistsService } from '../../../../_services/dataServices/checklists.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Checklist, lookupData } from '../../../../core/modals';
import { ImportModule } from '../../../../core/import/import.module';
import { LookupService } from '../../../../_services/dataServices/lookup.service';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { LbAutoCompleteComponent } from '../../../../core/lb-auto-complete/lb-auto-complete.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-checklist',
  standalone: true,
  imports: [ImportModule, VMessageComponent, LbAutoCompleteComponent],
  templateUrl: './new-checklist.component.html',
  styleUrl: './new-checklist.component.scss',
})
export class NewChecklistComponent implements OnDestroy {
  form!: FormGroup;
  id!: string;
  dataSource!: Checklist;
  selectChecklistType: lookupData[] = [];
  params: Params = {};
  routSub: Subscription;
  constructor(
    private router: Router,
    private checklistsService: ChecklistsService,
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private route: ActivatedRoute
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      checklistTypeId: ['', Validators.required],
      groups: this.formBuilder.array([])
    });
    // this.addItem();
    // this.addOption(0);
    this.getCheckListLookup();
    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getSingleChecklist(this.id);
      }
    });
  }

  getCheckListLookup() {
    const sub = this.lookupService
      .getSettingsLookup('ChecklistType')
      .subscribe({
        next: (res) => {
          this.selectChecklistType = res.data;
        },
        error: (res) => {
          sub.unsubscribe();
        },
      });
  }

  getSingleChecklist(id: string) {
    const sub = this.checklistsService.getSingleChecklist(id).subscribe({
      next: (res) => {
        this.dataSource = res.data;
        if (this.dataSource?.groups && this.dataSource?.groups.length > 0) {
          this.patchForm(this.dataSource)
        }
        this.form.patchValue({
          name: res.data.name ?? '',
          checklistTypeId: res.data.checklistTypeId ?? '',
        });
      },
      error: () => sub.unsubscribe(),
    });
  }

  updateStatus(id: string) {
    const sub = this.checklistsService.updateStatus(id).subscribe({
      next: (res) => {
        this.getSingleChecklist(this.id);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }


  get groups(): FormArray {
    return this.form.get('groups') as FormArray;
  }

  createItemForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required]],
      options: this.formBuilder.array([]),
    });
  }

  createOptionForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required]],
    });
  }

  addItem() {
    this.groups.push(this.createItemForm());
  }

  removeItem(index: number) {
    this.groups.removeAt(index);
  }

  getOptions(itemIndex: number): FormArray {
    return this.groups.at(itemIndex).get('options') as FormArray;
  }

  addOption(itemIndex: number) {
    this.getOptions(itemIndex).push(this.createOptionForm());
  }

  removeOption(itemIndex: number, optionIndex: number): void {
    this.getOptions(itemIndex).removeAt(optionIndex);
  }

  patchForm(data: any) {
    const groupsArray = this.form.get('groups') as FormArray;
    groupsArray.clear(); // clear old data

    data.groups.forEach((group: any) => {
      // Create a new group form
      const groupForm = this.createItemForm();

      // Patch the group's name
      groupForm.patchValue({ name: group.name });

      // Get the options array for this group
      const optionsArray = groupForm.get('options') as FormArray;

      // Add each option
      group.options.forEach((opt: any) => {
        const optionForm = this.createOptionForm();
        optionForm.patchValue({ name: opt.name });
        optionsArray.push(optionForm);
      });

      // Finally, push the full group form into groups array
      groupsArray.push(groupForm);
    });
  }


  submit() {
    if (this.form.valid) {
      const data = this.form.value;
      if (this.id != '') {
        const sub = this.checklistsService
          .createOrUpdateChecklist(data, this.id)
          .subscribe({
            next: (res) => {
              this.router.navigate(['checklists']);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {
        const sub = this.checklistsService
          .createOrUpdateChecklist(data)
          .subscribe({
            next: (res) => {
              this.router.navigate(['checklists']);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  goBack() {
    this.router.navigate(['/checklists']);
  }
  ngOnDestroy(): void {
    this.routSub.unsubscribe();
  }
}
