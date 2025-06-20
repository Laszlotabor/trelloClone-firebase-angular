import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service.service';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  private auth = inject(AuthServiceService);
  private router = inject(Router);
  isLoggedIn = false;

  constructor() {
    this.auth.user$.subscribe((user) => {
      this.isLoggedIn = !!user;
    });
  }

  logout() {
    this.auth.logout().then(() => this.router.navigate(['/login']));
  }
}
