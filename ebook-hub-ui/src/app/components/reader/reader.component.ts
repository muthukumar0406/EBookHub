import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookService, Book } from '../../services/book.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-reader',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './reader.component.html',
    styleUrls: ['./reader.component.css']
})
export class ReaderComponent implements OnInit {
    bookId: number | null = null;
    book: Book | null = null;
    safeUrl: SafeResourceUrl | null = null;
    fileType: string = '';
    errorMessage: string | null = null;
    isLoading: boolean = true;

    constructor(
        private route: ActivatedRoute,
        private bookService: BookService,
        private sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef
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
        this.isLoading = true;
        this.errorMessage = null;
        this.safeUrl = null;

        this.bookService.getBook(id).subscribe({
            next: (book) => {
                this.book = book;
                if (!book || !book.fileName) {
                    this.errorMessage = 'The requested book file could not be found.';
                    this.isLoading = false;
                    return;
                }

                const extension = book.fileName.split('.').pop()?.toLowerCase() || '';
                this.fileType = extension.toUpperCase();

                const baseUrl = environment.apiUrl.replace('/api', '');
                const fullUrl = `${baseUrl}/uploads/${book.fileName}`;

                // For PDF, we can add #toolbar=0 to make it cleaner, but let's stick to standard first
                this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading book:', err);
                this.errorMessage = 'Failed to connect to the server.';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }
}
