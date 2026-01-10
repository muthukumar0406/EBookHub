import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { BookService, Book } from '../../services/book.service';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-reader',
    standalone: true,
    imports: [CommonModule, NgxExtendedPdfViewerModule, RouterModule],
    templateUrl: './reader.component.html',
    styleUrls: ['./reader.component.css']
})
export class ReaderComponent implements OnInit {
    bookId: number | null = null;
    book: Book | null = null;
    pdfSrc: any;
    fileType: 'pdf' | 'html' | 'other' = 'pdf';
    safeUrl: any;
    errorMessage: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private bookService: BookService,
        private sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef,
        private http: HttpClient
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            this.bookId = id ? Number(id) : null;

            if (this.bookId) {
                this.loadBook(this.bookId);
            }
        });
    }

    loadBook(id: number) {
        this.errorMessage = null;
        this.pdfSrc = undefined;
        this.safeUrl = null;

        this.bookService.getBook(id).subscribe({
            next: (book) => {
                this.book = book;
                if (!book || !book.fileName) {
                    this.errorMessage = 'Book details incomplete.';
                    return;
                }

                const baseUrl = environment.apiUrl.replace('/api', '');
                const fullUrl = `${baseUrl}/uploads/${book.fileName}`;
                const extension = book.fileName.split('.').pop()?.toLowerCase();

                if (extension === 'pdf') {
                    this.fileType = 'pdf';
                    // Fetch as Blob for better reliability with the viewer
                    this.http.get(fullUrl, { responseType: 'blob' }).subscribe({
                        next: (blob) => {
                            this.pdfSrc = blob;
                            this.cdr.detectChanges();
                        },
                        error: (err) => {
                            console.error('PDF Blob Fetch Error:', err);
                            this.errorMessage = 'Could not download PDF file. Please check server permissions.';
                            this.cdr.detectChanges();
                        }
                    });
                } else {
                    this.fileType = (extension === 'html' || extension === 'htm') ? 'html' : 'other';
                    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.errorMessage = 'Failed to load book metadata.';
                this.cdr.detectChanges();
            }
        });
    }
}
