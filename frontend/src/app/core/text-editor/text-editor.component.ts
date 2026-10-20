import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularEditorModule } from '@wfpena/angular-wysiwyg';
@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [AngularEditorModule, FormsModule, ReactiveFormsModule],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss',
})
export class TextEditorComponent implements OnInit {
  @Input() fControl!: FormControl;
  @Input() placeholderText!: string;
  editorConfig = {
    editable: true,
    spellcheck: true,
    height: '200px',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    enableToolbar: true,
    showToolbar: true,
    // toolbarHiddenButtons: [
    //   // example: hide any tools you don't want
    //   ['subscript', 'superscript'],
    //   [
    //     'insertImage',
    //     'insertVideo',
    //     'ae-picker',
    //     'outdent',
    //     'insertHorizontalRule',
    //     'clearFormatting',
    //     'unlink',
    //     'backgroundColorPicker',
    //   ],
    // ],
    // toolbar: [
    //   ['textColor', 'bold', 'italic', 'underline', 'strikeThrough'],
    //   ['unorderedList', 'orderedList'],
    //   ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
    //   ['fontName', 'fontSize', 'backgroundColor'],
    // ],
  };
  constructor() {}

  ngOnInit(): void {}
}
