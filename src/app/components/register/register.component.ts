import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthServiceService,
    private router: Router
  ) {}

  register() {
    if (!this.email || !this.password) {
      alert('Please enter both email and password.');
      return;
    }

    this.authService
      .signUpWithEmail(this.email, this.password)
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch((err) => {
        alert(err.message || 'Registration failed.');
      });
  }
}
