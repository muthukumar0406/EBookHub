import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    protected readonly title = signal('ebook-hub-ui');
    private authService = inject(AuthService);

    userStatus = this.authService.currentUser$;

    isLoggedIn(): boolean {
        return !!this.authService.currentUserValue;
    }

    isAdmin(): boolean {
        return this.authService.currentUserValue?.role === 'Admin';
    }

    logout() {
        this.authService.logout().subscribe();
    }
}
