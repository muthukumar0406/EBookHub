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

    onIframeLoad(event: any) {
        const iframe = event.target as HTMLIFrameElement;
        if (!iframe || !this.book) return;

        const isHtml = this.book.fileName.toLowerCase().endsWith('.html') ||
            this.book.fileName.toLowerCase().endsWith('.htm');

        if (isHtml) {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (doc) {
                    // Check if viewport meta tag exists, if not add it
                    if (!doc.querySelector('meta[name="viewport"]')) {
                        const meta = doc.createElement('meta');
                        meta.name = 'viewport';
                        meta.content = 'width=device-width, initial-scale=1.0';
                        doc.head.appendChild(meta);
                    }

                    // Inject responsive styles
                    const style = doc.createElement('style');
                    style.textContent = `
                        html, body {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: auto;
                            -webkit-text-size-adjust: 100%;
                        }
                        body {
                            max-width: 100vw;
                            overflow-x: hidden;
                            word-wrap: break-word;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                            line-height: 1.6;
                            padding: 1.5rem;
                            box-sizing: border-box;
                            color: #1a1a1a;
                            background-color: #fafafa;
                            font-size: 16px;
                        }
                        img, video, canvas, svg {
                            max-width: 100% !important;
                            height: auto !important;
                        }
                        table {
                            width: 100% !important;
                            display: block;
                            overflow-x: auto;
                            border-collapse: collapse;
                        }
                        iframe {
                            max-width: 100% !important;
                        }
                        pre, code {
                            white-space: pre-wrap;
                            word-break: break-all;
                            background: #eee;
                            padding: 2px 4px;
                            border-radius: 4px;
                        }
                    `;
                    doc.head.appendChild(style);
                }
            } catch (e) {
                console.warn('Could not inject styles into iframe (check CORS):', e);
            }
        }
    }
}
