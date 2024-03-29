import { HttpClient, HttpEventType } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SwapDBService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  downloadFile(): void {
    this.http.get(this.baseUrl + 'DownloadDB', { responseType: 'blob' })
      .subscribe(blob => {
        this.downloadBlob(blob, 'SagraPOS.sqlite3');
      });
  }

  uploadFile(file: File): void {
    const formData = new FormData();
    formData.append('file', file, file.name);

    this.http.post(this.baseUrl + 'UploadDB', formData, {
      reportProgress: true,
      observe: 'events',
      responseType: 'text'
    }).subscribe(event => {
      if (event.type === HttpEventType.Response) {
        // File uploaded correctly, reload the page to restart application
        location.reload()
      }
    });
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = filename;
    anchor.href = url;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }
}
