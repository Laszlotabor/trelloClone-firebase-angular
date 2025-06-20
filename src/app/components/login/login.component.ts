import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private auth: AuthServiceService, private router: Router) {}

  login() {
    this.auth
      .signInWithEmail(this.email, this.password)
      .then(() => this.router.navigate(['/home']))
      .catch((err) => alert(err.message || 'Login failed.'));
  }

  loginWithGoogle() {
    this.auth
      .signInWithGoogle()
      .then(() => this.router.navigate(['/home']))
      .catch((err) => alert(err.message || 'Google sign-in failed.'));
  }
}
