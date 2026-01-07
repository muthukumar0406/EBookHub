import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    username = '';
    password = '';
    errorMessage = '';

    constructor(private authService: AuthService, private router: Router) { }

    loginAdmin() {
        this.authService.login({ username: this.username, password: this.password }).subscribe({
            next: (response) => {
                if (response.role === 'Admin') {
                    this.router.navigate(['/admin']);
                } else {
                    this.errorMessage = 'Not authorized as Admin';
                }
            },
            error: (err) => {
                this.errorMessage = 'Login failed';
                console.error(err);
            }
        });
    }

    loginUserGoogle() {
        this.authService.loginWithGoogle().subscribe({
            next: () => {
                // Navigation is handled in AuthService, but can be here too.
                console.log('Google login execution completed');
            },
            error: (err) => {
                this.errorMessage = 'Google Login failed';
                console.error(err);
            }
        });
    }
}
