import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-user-library',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './user-library.component.html',
    styleUrls: ['./user-library.component.css']
})
export class UserLibraryComponent implements OnInit, OnDestroy {
    books: Book[] = [];
    filteredBooks: Book[] = [];
    searchTerm = '';
    uploadsUrl = environment.apiUrl.replace('/api', '/uploads');

    isLoading = false;
    errorMessage = '';
    private authSub: Subscription | null = null;

    constructor(
        private bookService: BookService,
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        console.log('UserLibraryComponent: Initializing...');

        // Load books once immediately
        this.loadBooks();

        // Also subscribe to auth changes in case the login finishes after initialization
        this.authSub = this.authService.currentUser$.subscribe(user => {
            console.log('UserLibraryComponent: Auth state change detected:', user ? 'Logged In' : 'Logged Out');
            if (user && this.books.length === 0) {
                this.loadBooks();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.authSub) {
            this.authSub.unsubscribe();
        }
    }

    loadBooks() {
        if (this.isLoading) return;

        console.log('UserLibraryComponent: Attempting to fetch books...');
        this.isLoading = true;
        this.errorMessage = '';

        this.bookService.getBooks().subscribe({
            next: (data) => {
                console.log('UserLibraryComponent: Successfully fetched books:', data.length);
                this.books = data;
                this.filteredBooks = data;
                this.isLoading = false;
                this.cdr.detectChanges(); // Force UI update
            },
            error: (err) => {
                console.error('UserLibraryComponent: Failed to fetch books:', err);
                this.isLoading = false;
                this.errorMessage = 'Could not load library. Please check your connection.';
                this.cdr.detectChanges(); // Force UI update
            }
        });
    }

    search() {
        this.filteredBooks = this.books.filter(b =>
            b.title.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    openBook(id: number) {
        this.router.navigate(['/read', id]);
    }
}
