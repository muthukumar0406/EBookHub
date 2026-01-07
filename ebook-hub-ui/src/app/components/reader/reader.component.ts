import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer'; // Ensure this is installed
import { BookService, Book } from '../../services/book.service';

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
        this.bookId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.bookId) {
            this.bookService.getBooks().subscribe(books => {
                this.book = books.find(b => b.id === this.bookId) || null;
                if (this.book) {
                    // Assuming filePath coming from backend is relative or needs full URL prefix
                    // API uses static files at /uploads
                    this.pdfSrc = `http://localhost:5037/uploads/${this.book.filePath}`;
                }
            });
        }
    }
}
