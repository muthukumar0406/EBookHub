import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../../services/book.service';
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

    constructor(private bookService: BookService, private router: Router) { }

    ngOnInit(): void {
        this.bookService.getBooks().subscribe({
            next: (data) => {
                this.books = data;
                this.filteredBooks = data;
            },
            error: (err) => console.error(err)
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
