import { Component, EventEmitter, Output, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drag.component.html',
  styleUrl: './drag.component.scss'
})
export class DragComponent {
  @Output() fileDropped = new EventEmitter<FileList>();
  isHovering = false;
  @Input() extensions: string = 'PNG, JPG(max. 10MB)';
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isHovering = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isHovering = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isHovering = false;
    if (event.dataTransfer?.files.length) {
      this.fileDropped.emit(event.dataTransfer.files);
    }
  }

  onFileSelect(event: any) {
    this.fileDropped.emit(event.target.files);
  }
}
