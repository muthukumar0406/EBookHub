import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth, GoogleAuthProvider, authState, idToken, signInWithPopup, signOut } from '@angular/fire/auth';
import { BehaviorSubject, Observable, from, map, tap, switchMap, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = inject(Auth);
    private router = inject(Router);
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/auth`;

    private currentUserSubject = new BehaviorSubject<{ token: string; role: string } | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    // Expose the current user directly from Firebase
    user$ = authState(this.auth);

    // Signal or Observable for the token
    idToken$ = idToken(this.auth);

    constructor() {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token && role) {
            this.currentUserSubject.next({ token, role });
        }
    }
  

    // Restore currentUserValue for backward compatibility (used by BookService and App)
    get currentUserValue(): { token: string; role: string } | null {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role'); // 'Admin' or 'User'
        if (token) {
            return { token, role: role || '' };
        }
        return null;
    }

    // Admin Login (Legacy/Specific)
    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin-login`, credentials).pipe(
            tap((response: any) => {
                localStorage.setItem('token', response.token);
                localStorage.setItem('role', response.role);
                this.currentUserSubject.next({ token: response.token, role: response.role });
            })
        );
    }

    // Login with Google and verify with Backend
    loginWithGoogle(): Observable<void> {
        const provider = new GoogleAuthProvider();
        return from(signInWithPopup(this.auth, provider)).pipe(
            switchMap(result => {
                const user = result.user;
                return from(user.getIdToken()).pipe(
                    map(token => ({ token, email: user.email, name: user.displayName, googleId: user.uid }))
                );
            }),
            switchMap(payload => {
                // Send token to backend for verification and user creation
                return this.http.post(`${this.apiUrl}/google-login`, {
                    idToken: payload.token,
                    email: payload.email,
                    name: payload.name,
                    googleId: payload.googleId
                });
            }),
            tap((response: any) => {
                localStorage.setItem('token', response.token);
                localStorage.setItem('role', response.role);
                this.currentUserSubject.next({ token: response.token, role: response.role });

                if (response.role === 'Admin') {
                    this.router.navigate(['/admin']);
                } else {
                    this.router.navigate(['/library']);
                }
            }),
            map(() => void 0)
        );
    }

    logout() {
        return from(signOut(this.auth)).pipe(
            tap(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                this.currentUserSubject.next(null);
                this.router.navigate(['/login']);
            })
        );
    }

    // Helper to get current token promise
    async getIdToken(): Promise<string | null> {
        const user = this.auth.currentUser;
        if (user) {
            return user.getIdToken();
        }
        return null;
    }
}
