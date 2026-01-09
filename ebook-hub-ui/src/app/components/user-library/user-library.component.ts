import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-user-library',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './user-library.component.html',
    styleUrls: ['./user-library.component.css']
})
export class UserLibraryComponent implements OnInit {
    books: Book[] = [];
    filteredBooks: Book[] = [];
    searchTerm = '';

    constructor(
        private bookService: BookService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Load immediately if we already have user info
        if (this.authService.currentUserValue) {
            this.loadBooks();
        }

        // Also subscribe to ensure it loads after a fresh login
        this.authService.currentUser$.subscribe(user => {
            if (user && this.books.length === 0) {
                this.loadBooks();
            }
        });
    }

    loadBooks() {
        this.bookService.getBooks().subscribe({
            next: (data) => {
                this.books = data;
                this.filteredBooks = data;
            },
            error: (err) => console.error('Error loading books:', err)
        });
    }

    search() {
        this.filteredBooks = this.books.filter(b =>
            b.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            b.author.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    openBook(id: number) {
        this.router.navigate(['/read', id]);
    }
}
