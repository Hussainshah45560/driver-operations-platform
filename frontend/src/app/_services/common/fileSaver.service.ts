import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileSaverService {
  constructor(private http: HttpClient) { }

  downloadFile(url: string, fileName: string) {
    // Check if string is Base64 (starts with /9j or contains data:image)
    const isBase64 = url.startsWith('/9') || url.includes('base64,');

    if (isBase64) {
      // Remove header if present
      let base64 = url;
      if (url.includes('base64,')) {
        base64 = url.split('base64,')[1];
      }

      // Convert Base64 → Blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      // Download same as your existing function
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(blobUrl);

    } else {
      this.http.get(url, { responseType: 'blob' }).subscribe((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(blobUrl);
      });
    }
  }
}