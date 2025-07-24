// src/app/services/user.service.ts
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SnackBarService {
  private _snackBar = inject(MatSnackBar);
  private _router = inject(Router);

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
    });
  }

  notificationAdmin(message: string, action: string, redirectTo?: string) {
    const snackBarRef = this._snackBar.open(message, action);

    snackBarRef.onAction().subscribe(() => {
      if (redirectTo) {
        this._router.navigate([redirectTo]);
      }
    });
  }
}
