import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
    books: Book[] = [];
    title = '';
    author = '';
    selectedFile: File | null = null;
    selectedCoverFile: File | null = null;
    message = '';

    constructor(private bookService: BookService, private authService: AuthService) { }

    ngOnInit(): void {
        const user = this.authService.currentUserValue;
        if (!user || user.role !== 'Admin') {
            this.message = 'Access Denied. Please login as Admin.';
            setTimeout(() => this.authService.logout().subscribe(), 2000);
            return;
        }
        this.loadBooks();
    }

    loadBooks() {
        this.bookService.getBooks().subscribe({
            next: (data) => this.books = data,
            error: (err) => console.error(err)
        });
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
    }

    onCoverSelected(event: any) {
        this.selectedCoverFile = event.target.files[0];
    }

    uploadBook() {
        if (!this.selectedFile || !this.title || !this.author) {
            this.message = 'Please fill all fields';
            return;
        }

        const formData = new FormData();
        formData.append('title', this.title);
        formData.append('author', this.author);
        formData.append('file', this.selectedFile);
        if (this.selectedCoverFile) {
            formData.append('coverImage', this.selectedCoverFile);
        }

        this.bookService.uploadBook(formData).subscribe({
            next: () => {
                this.message = 'Upload successful';
                this.loadBooks();
                this.title = '';
                this.author = '';
                this.selectedFile = null;
                this.selectedCoverFile = null;
            },
            error: (err) => {
                this.message = `Upload failed: ${err.statusText || 'Unknown error'}. Please check if the file is too large or the server is reachable.`;
                console.error('Upload Error:', err);
            }
        });
    }

    deleteBook(id: number) {
        if (confirm('Are you sure you want to delete this book?')) {
            this.bookService.deleteBook(id).subscribe({
                next: () => this.loadBooks(),
                error: (err) => console.error(err)
            });
        }
    }

    logout() {
        this.authService.logout().subscribe();
    }
}
