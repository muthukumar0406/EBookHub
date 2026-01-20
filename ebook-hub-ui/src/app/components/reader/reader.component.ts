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
    zoomLevel: number = 1.0;
    currentPage: number = 1;
    totalPages: number = 0;
    isHtml: boolean = false;
    lastSavedPage: number = 0;
    showResumePrompt: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private bookService: BookService,
        private sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef
    ) {
        // Listen for scroll messages from the iframe
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'pageUpdate') {
                this.currentPage = event.data.currentPage;
                this.totalPages = event.data.totalPages;
                this.cdr.detectChanges();

                // Auto-save progress for HTML books (only if page changed)
                if (this.isHtml && this.bookId && this.currentPage !== this.lastSavedPage) {
                    this.saveReadingProgress(this.currentPage);
                    this.lastSavedPage = this.currentPage;
                }
            }
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            this.bookId = id ? Number(id) : null;

            if (this.bookId) {
                this.loadBook(this.bookId);
            }
        });
    }

    zoomIn() {
        if (this.zoomLevel < 3.0) {
            this.zoomLevel += 0.1;
            this.applyZoom();
            setTimeout(() => this.applyZoom(), 50); // Double call to catch async dynamic content
        }
    }

    zoomOut() {
        if (this.zoomLevel > 0.5) {
            this.zoomLevel -= 0.1;
            this.applyZoom();
            setTimeout(() => this.applyZoom(), 50);
        }
    }

    private applyZoom() {
        const iframe = document.querySelector('iframe');
        if (iframe) {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (doc) {
                    const body = doc.body;
                    body.style.setProperty('font-size', `${100 * this.zoomLevel}%`, 'important');
                    // Also force children if they have hardcoded font sizes
                    const allElements = doc.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6');
                    allElements.forEach((el: any) => {
                        el.style.setProperty('font-size', 'inherit', 'important');
                    });
                }
            } catch (e) {
                console.warn('Could not apply zoom to iframe body:', e);
            }
        }
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

                // Load reading progress
                this.loadReadingProgress();

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

        this.isHtml = this.book.fileName.toLowerCase().endsWith('.html') ||
            this.book.fileName.toLowerCase().endsWith('.htm');

        if (this.isHtml) {
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
                        /* Global reset to break absolute positioning and overlapping */
                        * {
                            max-width: 100% !important;
                            box-sizing: border-box !important;
                            overflow-wrap: break-word !important;
                            position: relative !important; 
                            top: auto !important; 
                            left: auto !important; 
                            right: auto !important; 
                            bottom: auto !important;
                            transform: none !important;
                            height: auto !important;
                        }

                        html, body {
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100% !important;
                            height: auto !important;
                            -webkit-text-size-adjust: 100% !important;
                            background-color: #ffffff !important;
                        }

                        body {
                            padding: 1.5rem !important;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                            line-height: 1.6 !important;
                            color: #1a1a1a !important;
                            font-size: 100% !important; 
                            display: flex !important;
                            flex-direction: column !important;
                            align-items: stretch !important;
                        }

                        h1, h2, h3, h4, h5, h6 {
                            width: 100% !important;
                            line-height: 1.25 !important;
                            margin-top: 1.5rem !important;
                            margin-bottom: 1rem !important;
                            color: #000 !important;
                            display: block !important;
                            font-size: clamp(1.2rem, 5vw, 2.5rem) !important;
                        }

                        p, div, span {
                            width: 100% !important;
                            display: block !important;
                            margin-bottom: 0.75rem !important;
                            font-size: inherit !important; 
                        }

                        img, svg, canvas {
                            display: block !important;
                            margin: 1.5rem auto !important;
                            max-width: 100% !important;
                            height: auto !important;
                        }
                    `;
                    doc.head.appendChild(style);

                    // Inject pagination/scroll reporting script
                    const script = doc.createElement('script');
                    script.textContent = `
                        function reportPages() {
                            const scrollHeight = document.documentElement.scrollHeight;
                            const clientHeight = document.documentElement.clientHeight;
                            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                            
                            const totalPages = Math.max(1, Math.ceil(scrollHeight / clientHeight));
                            const currentPage = Math.max(1, Math.min(totalPages, Math.floor(scrollTop / clientHeight) + 1));
                            
                            window.parent.postMessage({
                                type: 'pageUpdate',
                                currentPage: currentPage,
                                totalPages: totalPages
                            }, '*');
                        }

                        window.addEventListener('scroll', reportPages);
                        window.addEventListener('resize', reportPages);
                        setTimeout(reportPages, 500);
                        const observer = new ResizeObserver(reportPages);
                        observer.observe(document.body);
                    `;
                    doc.body.appendChild(script);

                    this.applyZoom();
                }
            } catch (e) {
                console.warn('Could not inject into iframe:', e);
            }
        }
    }

    loadReadingProgress() {
        if (!this.bookId) return;

        this.bookService.getProgress(this.bookId).subscribe({
            next: (progress) => {
                if (progress && progress.lastReadPage > 1) {
                    this.lastSavedPage = progress.lastReadPage;
                    this.showResumePrompt = true;
                    this.cdr.detectChanges();
                }
            },
            error: (err) => console.log('No previous progress found or error:', err)
        });
    }

    resumeReading() {
        this.showResumePrompt = false;
        if (this.lastSavedPage > 1) {
            this.scrollToPage(this.lastSavedPage);
        }
    }

    dismissResume() {
        this.showResumePrompt = false;
    }

    saveReadingProgress(page: number) {
        if (!this.bookId) return;
        this.bookService.saveProgress(this.bookId, page).subscribe({
            next: () => console.log('Progress saved:', page),
            error: (err) => console.error('Error saving progress:', err)
        });
    }

    markAsFinished() {
        if (!this.bookId) return;
        // User manually marks current page
        this.saveReadingProgress(this.currentPage);
        alert(`Progress saved: Page ${this.currentPage}`);
    }

    scrollToPage(page: number) {
        this.currentPage = page;
        const iframe = document.querySelector('iframe');
        if (iframe) {
            if (this.isHtml) {
                try {
                    const doc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (doc && iframe.contentWindow) {
                        const clientHeight = doc.documentElement.clientHeight;
                        const scrollPosition = (page - 1) * clientHeight;
                        iframe.contentWindow.scrollTo({
                            top: scrollPosition,
                            behavior: 'smooth'
                        });
                    }
                } catch (e) {
                    console.warn('Could not scroll iframe:', e);
                }
            } else {
                // For PDF, we might need to append #page=N to the URL
                // But this causes iframe reload. 
                const baseUrl = environment.apiUrl.replace('/api', '');
                const fullUrl = `${baseUrl}/uploads/${this.book?.fileName}#page=${page}`;
                this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
            }
        }
    }
}
