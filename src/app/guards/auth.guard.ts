import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private auth = inject(Auth);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.auth.currentUser) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
