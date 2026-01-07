import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Book {
    id: number;
    title: string;
    author: string;
    filePath: string;
    uploadDate: string;
}

@Injectable({
    providedIn: 'root'
})
export class BookService {


    private apiUrl = `${environment.apiUrl}/books`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        const user = this.authService.currentUserValue;
        const token = user?.token;
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getBooks(): Observable<Book[]> {
        return this.http.get<Book[]>(this.apiUrl, { headers: this.getHeaders() });
    }

    uploadBook(formData: FormData): Observable<any> {
        return this.http.post(this.apiUrl, formData, { headers: this.getHeaders() });
    }

    deleteBook(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }
}
