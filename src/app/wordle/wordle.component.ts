import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-wordle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wordle.component.html',
  styleUrl: './wordle.component.css'
})
export class WordleComponent {
  grid = Array(6).fill(null).map(() => Array(5).fill({ letter: '', status: '' }));
  keyboard = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').map(letter => ({ letter, disabled: false }));
  message = 'Start guessing!';

  onKeyPress(key: { letter: string; disabled: boolean }) {
    console.log('Key Pressed:', key.letter);
    // Handle key press logic (filling grid, checking word)
  }
}
