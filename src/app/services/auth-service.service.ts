import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private auth: Auth = inject(Auth);
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  // ✅ Google Sign-In
  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  // ✅ Email/Password Sign-Up
  signUpWithEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // ✅ Email/Password Sign-In
  signInWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // ✅ Logout
  logout() {
    return signOut(this.auth);
  }

  // ✅ Get current user ID
  get currentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  // ✅ Get current user object
  get currentUser(): User | null {
    return this.auth.currentUser;
  }
}