import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class EmojiSnackBarService {
  private emojis = ['👏', '🙌', '🙏', '💃', '🎉', '🚀', '🥳', '✨', '🌟', '🎊', '👍', '🎆', '🔥', '💪', '🌈', '😎', '💯', '🏆', '🥂', '🎖️', '🎁', '🥇', '🤩', '🍾', '🤗', '🌸'];

  public duration: number = 5000;
  public position: 'start' | 'center' | 'end' | 'left' | 'right' = 'start';

  constructor(private snackBar: MatSnackBar) {}

  private getRandomEmoji(): string {
    const randomIndex = Math.floor(Math.random() * this.emojis.length);
    return this.emojis[randomIndex];
  }

  private showMessage(message: string, panelClass: string): void {
    const config: MatSnackBarConfig = {
      duration: this.duration,
      horizontalPosition: this.position,
      verticalPosition: 'bottom',
      panelClass: panelClass
    };
    this.snackBar.open(message, 'Close', config);
  }

  showSuccess(message: string = 'OK'): void {
    const emoji = this.getRandomEmoji();
    this.showMessage(`${message} ${emoji}`, 'success-snackbar');
  }

  showError(message: string = 'ERROR'): void {
    this.showMessage(`${message} ❌`, 'error-snackbar');
  }
}
