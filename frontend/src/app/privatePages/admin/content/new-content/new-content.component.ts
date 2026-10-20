import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContentService } from '../../../../_services/dataServices/content.service';
import { Content } from '../../../../core/modals';
import { ImportModule } from '../../../../core/import/import.module';
import { VMessageComponent } from '../../../../core/v-message/v-message.component';
import { TextEditorComponent } from '../../../../core/text-editor/text-editor.component';

@Component({
  selector: 'app-new-content',
  standalone: true,
  imports: [ImportModule, VMessageComponent, TextEditorComponent],
  templateUrl: './new-content.component.html',
  styleUrl: './new-content.component.scss',
})
export class NewContentComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  data!: Content;
  params: Params = {};
  routSub: Subscription;
  id!: string;
  constructor(
    private formBuilder: FormBuilder,
    private contentService: ContentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      heading: ['', Validators.required],
      description: ['', [Validators.required]],
      isActive: [false],
    });

    this.routSub = this.route.params.subscribe((params) => {
      this.params = params;
      this.id = params['id'];
      if (this.id != null) {
        this.getSingleContent(this.id);
      }
    });
  }
  ngOnInit(): void {}

  getSingleContent(id: string) {
    const sub = this.contentService.getSingleContent(id).subscribe({
      next: (res) => {
        this.data = res.data;
        this.form.patchValue({
          title: res.data.title ?? '',
          heading: res.data.heading ?? '',
          description: res.data.description ?? '',
          isActive: res.data.isActive ?? false,
        });
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  updateStatus(id: string) {
    const sub = this.contentService.updateStatus(id).subscribe({
      next: (res) => {
        this.getSingleContent(this.id);
      },
      error: (res) => {
        sub.unsubscribe();
      },
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.value;
      if (this.id != '') {
        const sub = this.contentService
          .createOrUpdateContent(data, this.id)
          .subscribe({
            next: (res) => {
              this.router.navigate(['content']);
              sub.unsubscribe();
            },
            error: (res) => {
              sub.unsubscribe();
            },
          });
      } else {
        const sub = this.contentService.createOrUpdateContent(data).subscribe({
          next: (res) => {
            this.router.navigate(['content']);
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
    this.router.navigate(['content']);
  }

  ngOnDestroy(): void {
    this.routSub.unsubscribe();
  }
}
