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

    constructor(private route: ActivatedRoute, private bookService: BookService) { }

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        this.bookId = idParam ? Number(idParam) : null;

        if (this.bookId) {
            this.bookService.getBooks().subscribe({
                next: (books) => {
                    this.book = books.find(b => b.id === this.bookId) || null;
                    if (this.book) {
                        // Correctly pointing to the backend's static file serving endpoint
                        const baseUrl = environment.apiUrl.replace('/api', '');
                        this.pdfSrc = `${baseUrl}/uploads/${this.book.fileName}`;
                        console.log('Opening PDF from:', this.pdfSrc);
                    } else {
                        console.error('Book not found in library');
                    }
                },
                error: (err) => {
                    console.error('Error loading book details:', err);
                }
            });
        }
    }
}
