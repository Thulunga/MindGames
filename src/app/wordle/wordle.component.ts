import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-wordle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wordle.component.html',
  styleUrls: ['./wordle.component.css'],
})
export class WordleComponent {
  private http = inject(HttpClient); // Inject HttpClient

  correctWord = 'WATCH';
  grid = Array(6)
    .fill(null)
    .map(() => Array(5).fill({ letter: '', status: '' }));
  keyboard = 'QWERTYUIOPASDFGHJKLZXCVBNM'
    .split('')
    .map((letter) => ({ letter, status: '' }));
  message = 'Start guessing!';

  currentRow = 0;
  currentCol = 0;
  apiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

  onKeyPress(key: { letter: string; status: string }) {
    if (this.currentCol < 5) {
      this.grid[this.currentRow][this.currentCol] = {
        letter: key.letter,
        status: '',
      };
      this.currentCol++;
    }
  }

  onBackspace() {
    if (this.currentCol > 0) {
      this.currentCol--;
      this.grid[this.currentRow][this.currentCol] = { letter: '', status: '' };
    }
  }

  onEnter() {
    if (this.currentCol === 5) {
      const guessedWord = this.grid[this.currentRow]
        .map((cell) => cell.letter)
        .join('');

      this.checkWordValidity(guessedWord);
    } else {
      this.message = 'Word must be 5 letters!';
    }
  }

  checkWordValidity(guessedWord: string) {
    this.http.get(`${this.apiUrl}${guessedWord.toLowerCase()}`).subscribe({
      next: () => {
        this.checkWord(guessedWord);
      },
      error: () => {
        this.message = `❌ "${guessedWord}" is not a valid word!`;
      },
    });
  }

  checkWord(guessedWord: string) {
    const correctLetters = this.correctWord.split('');
    const guessedLetters = guessedWord.split('');

    guessedLetters.forEach((letter, index) => {
      let status = 'absent';

      if (letter === correctLetters[index]) {
        status = 'correct';
      } else if (correctLetters.includes(letter)) {
        status = 'present';
      }

      this.grid[this.currentRow][index] = { letter, status };
      this.updateKeyboard(letter, status);
    });

    if (guessedWord === this.correctWord) {
      this.message = '🎉 You guessed it!';
    } else if (this.currentRow === 5) {
      this.message = `❌ Game Over! The word was "${this.correctWord}".`;
    } else {
      this.currentRow++;
      this.currentCol = 0;
      this.message = 'Try again!';
    }
  }

  updateKeyboard(letter: string, status: string) {
    const key = this.keyboard.find((k) => k.letter === letter);
    if (key && key.status !== 'correct') {
      key.status = status;
    }
  }
}
