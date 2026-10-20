// scroll.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  private container?: HTMLElement;

  /** Register the scrollable container (e.g., your .innerScrollBar) */
  setContainer(container: HTMLElement) {
    this.container = container;
  }

  /** Scroll to the first invalid field inside the container */
  scrollToFirstInvalid(padding: number = 16) {
    if (!this.container) return;

    // Use setTimeout to wait for Angular to update DOM classes
    setTimeout(() => {
      const firstInvalid: HTMLElement | null = this.container!.querySelector('.mat-form-field-invalid');
      if (firstInvalid) {
        const containerRect = this.container!.getBoundingClientRect();
        const fieldRect = firstInvalid.getBoundingClientRect();
        const offset = fieldRect.top - containerRect.top + this.container!.scrollTop - padding;
        this.container!.scrollTo({ top: offset, behavior: 'smooth' });
        firstInvalid.focus();
      }
    }, 0);
  }
}