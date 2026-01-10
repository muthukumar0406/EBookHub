import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { BookService, Book } from '../../services/book.service';
import { environment } from '../../../environments/environment';
import { timeout } from 'rxjs';

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

    constructor(
        private route: ActivatedRoute,
        private bookService: BookService,
        private sanitizer: DomSanitizer
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
        });
    }

    loadBook(id: number) {
        console.log('ReaderComponent: Fetching details for book ID:', id);
        this.errorMessage = null;
        this.pdfSrc = undefined;
        this.safeUrl = null;

        this.bookService.getBook(id).pipe(timeout(10000)).subscribe({
            next: (book) => {
                console.log('ReaderComponent: Received book data:', book);
                this.book = book;

                if (!book || !book.fileName) {
                    this.errorMessage = 'Invalid book data received: FileName is missing.';
                    console.error('ReaderComponent: Book data is invalid', book);
                    return;
                }

                const baseUrl = environment.apiUrl.replace('/api', '');
                const fullUrl = `${baseUrl}/uploads/${book.fileName}`;
                const encodedUrl = encodeURI(fullUrl);
                const extension = book.fileName.split('.').pop()?.toLowerCase();

                console.log('ReaderComponent: Constructed URL:', encodedUrl);
                console.log('ReaderComponent: File extension:', extension);

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

                console.log('ReaderComponent: fileType set to:', this.fileType);
            },
            error: (err) => {
                console.error('ReaderComponent: Error fetching book:', err);
                if (err.name === 'TimeoutError') {
                    this.errorMessage = 'The request timed out (10s). The server might be slow or unreachable.';
                } else if (err.status === 404) {
                    this.errorMessage = 'Book not found on the server (404).';
                } else if (err.status === 401) {
                    this.errorMessage = 'You are not authorized (401). Please login again.';
                } else if (err.status === 0) {
                    this.errorMessage = 'Cannot reach the server. Please check if the backend API is running on ' + environment.apiUrl;
                } else {
                    this.errorMessage = 'Request failed: ' + (err.statusText || err.message || 'Unknown Error');
                }
            }
        });
    }
}
