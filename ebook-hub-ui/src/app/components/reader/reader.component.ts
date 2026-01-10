import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer'; // Ensure this is installed
import { BookService, Book } from '../../services/book.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-reader',
    standalone: true,
    imports: [CommonModule, NgxExtendedPdfViewerModule],
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
        this.errorMessage = null;
        this.pdfSrc = undefined;
        const idParam = this.route.snapshot.paramMap.get('id');
        console.log('ReaderComponent: idParam =', idParam);
        this.bookId = idParam ? Number(idParam) : null;

        if (this.bookId && !isNaN(this.bookId)) {
            this.bookService.getBook(this.bookId).subscribe({
                next: (book) => {
                    console.log('ReaderComponent: Book fetched successfully', book);
                    this.book = book;
                    if (this.book && this.book.fileName) {
                        const baseUrl = environment.apiUrl.replace('/api', '');
                        const fullUrl = `${baseUrl}/uploads/${this.book.fileName}`;
                        const extension = this.book.fileName.split('.').pop()?.toLowerCase();

                        if (extension === 'pdf') {
                            this.fileType = 'pdf';
                            this.pdfSrc = fullUrl;
                        } else if (extension === 'html' || extension === 'htm') {
                            this.fileType = 'html';
                            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
                        } else {
                            this.fileType = 'other';
                            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
                        }

                        console.log('ReaderComponent: File type determined as:', this.fileType);
                        console.log('ReaderComponent: Setting URL to:', fullUrl);
                    } else {
                        this.errorMessage = 'Book not found in library';
                        console.error('ReaderComponent: Book found but has no fileName');
                    }
                },
                error: (err) => {
                    this.errorMessage = 'Could not load book details. Please check if the server is running.';
                    console.error('ReaderComponent: Error loading book by ID:', err);
                }
            });
        } else {
            this.errorMessage = 'Invalid book ID provided.';
            console.error('ReaderComponent: Invalid bookId:', this.bookId);
        }
    }
}
