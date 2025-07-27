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
import { Database, ref, set, get } from '@angular/fire/database';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private auth: Auth = inject(Auth);
  private db: Database = inject(Database);

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  // ✅ Helper to safely write user to /users/{uid}
  private async saveUserProfile(user: User): Promise<void> {
    if (!user.uid || !user.email) {
      console.error('❌ Cannot write user — missing UID or email');
      return;
    }

    // ✅ Wait until Firebase recognizes the session
    await new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (authedUser) => {
        if (authedUser?.uid === user.uid) {
          unsubscribe(); // stop listening
          resolve();
        }
      });
    });

    try {
      console.log('✅ Writing user to /users/' + user.uid);
      await set(ref(this.db, 'users/' + user.uid), {
        email: user.email,
      });
    } catch (err) {
      console.error('❌ Failed to write user to DB:', err);
    }
  }

  // ✅ Google Sign-In
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const user = result.user;

    await this.saveUserProfile(user);

    return result;
  }

  // ✅ Email/Password Sign-Up
  async signUpWithEmail(email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    const user = credential.user;

    await this.saveUserProfile(user);

    return credential;
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

  // ✅ Check if a user is registered based on DB
  async isRegisteredUser(email: string): Promise<boolean> {
    const snapshot = await get(ref(this.db, 'users'));
    if (!snapshot.exists()) return false;

    const users = snapshot.val();
    return Object.values(users).some(
      (user: any) => user.email?.toLowerCase() === email.toLowerCase()
    );
  }
}
