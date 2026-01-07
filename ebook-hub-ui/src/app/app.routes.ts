import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserLibraryComponent } from './components/user-library/user-library.component';
import { ReaderComponent } from './components/reader/reader.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'admin', component: AdminDashboardComponent },
    { path: 'library', component: UserLibraryComponent },
    { path: 'read/:id', component: ReaderComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
