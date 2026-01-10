import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

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
    uploadsUrl = environment.apiUrl.replace('/api', '/uploads');

    constructor(
        private bookService: BookService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        console.log('UserLibraryComponent: Initializing...');

        // Initial load attempt
        this.loadBooks();

        // Ensure we catch state changes (like right after login)
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                console.log('UserLibraryComponent: User state detected, loading books...');
                this.loadBooks();
            }
        });
    }

    loadBooks() {
        this.bookService.getBooks().subscribe({
            next: (data) => {
                console.log('UserLibraryComponent: Books loaded successfully', data.length);
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
