import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { BookService, Book } from '../../services/book.service';
import { environment } from '../../../environments/environment';

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
    pdfSrc: string | undefined;
    fileType: 'pdf' | 'html' | 'other' = 'pdf';
    safeUrl: any;
    errorMessage: string | null = null;
    fetchStarted = false;

    constructor(
        private route: ActivatedRoute,
        private bookService: BookService,
        private sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            console.log('ReaderComponent: Route param id =', id);
            this.bookId = id ? Number(id) : null;

            if (this.bookId) {
                this.loadBook(this.bookId);
            } else {
                this.errorMessage = 'No book ID provided in the URL.';
            }
            this.cdr.detectChanges();
        });
    }

    loadBook(id: number) {
        console.log('ReaderComponent: Initiating fetch for book ID:', id);
        this.fetchStarted = true;
        this.errorMessage = null;
        this.pdfSrc = undefined;
        this.safeUrl = null;
        this.book = null;

        // Using a plain subscription without timeout operator first to simplify debugging
        this.bookService.getBook(id).subscribe({
            next: (book) => {
                console.log('ReaderComponent: METADATA LOADED SUCCESS', book);
                this.book = book;

                if (!book || !book.fileName) {
                    this.errorMessage = 'Invalid book data received from server.';
                    console.error('ReaderComponent: Missing FileName in response');
                } else {
                    const baseUrl = environment.apiUrl.replace('/api', '');
                    const fullUrl = `${baseUrl}/uploads/${book.fileName}`;
                    const encodedUrl = encodeURI(fullUrl);
                    const extension = book.fileName.split('.').pop()?.toLowerCase();

                    if (extension === 'pdf') {
                        this.fileType = 'pdf';
                        this.pdfSrc = encodedUrl;
                    } else if (extension === 'html' || extension === 'htm') {
                        this.fileType = 'html';
                        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(encodedUrl);
                    } else {
                        this.fileType = 'other';
                        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(encodedUrl);
                    }
                    console.log('ReaderComponent: READY to show content of type:', this.fileType);
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('ReaderComponent: FETCH ERROR', err);
                this.errorMessage = `Failed to load book metadata (Status: ${err.status}). ` + (err.error || err.message || '');
                this.cdr.detectChanges();
            }
        });

        // Forced fallback if request stays pending too long
        setTimeout(() => {
            if (!this.book && !this.errorMessage) {
                console.warn('ReaderComponent: Request still pending after 8 seconds - check network tab');
                this.errorMessage = 'The server is taking too long to respond. Please ensure the backend is running and reachable.';
                this.cdr.detectChanges();
            }
        }, 8000);
    }
}
