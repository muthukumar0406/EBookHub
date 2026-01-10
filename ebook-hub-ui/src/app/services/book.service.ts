import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Book {
    id: number;
    title: string;
    author: string;
    fileName: string; // Matches 'FileName' from C#
    coverImageName?: string;
    uploadDate: string;
}

@Injectable({
    providedIn: 'root'
})
export class BookService {


    private apiUrl = `${environment.apiUrl}/books`;

    constructor(private http: HttpClient) { }

    getBooks(): Observable<Book[]> {
        return this.http.get<Book[]>(this.apiUrl);
    }

    getBook(id: number): Observable<Book> {
        return this.http.get<Book>(`${this.apiUrl}/${id}`);
    }

    uploadBook(formData: FormData): Observable<any> {
        return this.http.post(this.apiUrl, formData);
    }

    deleteBook(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
