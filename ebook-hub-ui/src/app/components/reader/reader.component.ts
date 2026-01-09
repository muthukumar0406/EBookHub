import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    errorMessage: string | null = null;

    constructor(private route: ActivatedRoute, private bookService: BookService) { }

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
                        // Correctly pointing to the backend's static file serving endpoint
                        const baseUrl = environment.apiUrl.replace('/api', '');
                        // Use encodeURIComponent just in case the filename has spaces or special chars
                        const safeFileName = encodeURIComponent(this.book.fileName);
                        this.pdfSrc = `${baseUrl}/uploads/${this.book.fileName}`; // Use raw fileName first as it includes the UID

                        // If it has spaces, the browser usually handles it but let's be safe
                        if (this.book.fileName.includes(' ')) {
                            this.pdfSrc = `${baseUrl}/uploads/${encodeURI(this.book.fileName)}`;
                        }

                        console.log('ReaderComponent: Setting pdfSrc to:', this.pdfSrc);
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
