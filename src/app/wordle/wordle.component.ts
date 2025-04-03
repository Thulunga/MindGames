import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-wordle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wordle.component.html',
  styleUrls: ['./wordle.component.css'],
})
export class WordleComponent implements OnInit {
  private http = inject(HttpClient);

  wordList = [
    "BLEND", "CRISP", "FLARE", "GLOBE", "SWIRL",
    "CHANT", "VAULT", "PLUSH", "BROOD", "GRASP",
    "FROST", "CLASH", "SWEEP", "QUIRK", "DROOP",
    "BLAZE", "PRISM", "STOUT", "TWINE", "WOVEN",
    "GLINT", "CHARM", "FIBER", "TWEAK", "SCORN",
    "CRAVE", "SPECK", "PLUCK", "BRISK", "GLARE",
    "SCOUT", "VAULT", "FROWN", "TWIRL", "SHRUB",
    "CHIRP", "SPLIT", "THROB", "SHARD", "STARK",
    "CRISP", "FLOUR", "PLATE", "GLAND", "DROOL",
    "FLICK", "SWARM", "QUAKE", "BROOM", "SHOVE",

    "MIRTH", "SLANT", "THRUM", "FABLE", "SNOUT",
    "PRONG", "HATCH", "DUSKY", "WHEAT", "SCOFF",
    "GUSTY", "CHASM", "JOLLY", "DRIFT", "BRAWN",
    "QUAIL", "STINT", "TWIST", "BRIAR", "FLUKE",
    "SPARK", "CLEFT", "FRISK", "GROVE", "PLUME",
    "SCAMP", "TROVE", "WRATH", "BLUSH", "THUMP",
    "SWOOP", "QUART", "CLOVE", "GRIME", "STRAY",
    "SQUIB", "DWELL", "CRUSH", "BUDGE", "GRAFT",
    "KNAVE", "MOTIF", "FLOUT", "SNARE", "VAPOR",
    "QUIET", "PRUNE", "BATCH", "SWISH", "CHIRK",
    "TWANG", "WHIRL", "SLOPE", "THORN", "CRAZE",
    "GRIND", "TWEET", "SCOOT", "PLANK", "BRIEF",
    "DROVE", "SCRAP", "HUNCH", "STOMP", "BRACE",
    "FUDGE", "GLOAT", "MOTEL", "PLAZA", "SHOAL",
    "TANGO", "VAUNT", "WIELD", "YACHT", "BLIMP",
    "THYME", "SPOUT", "DWARF", "PLATE", "MARCH",
    "STONY", "PRISM", "BRUNT", "TWILL", "WOOZY",
    "CLOUT", "GLOSS", "SQUAT", "FROCK", "SNIPE",
    "WHINE", "SCUFF", "GROAN", "WRAST", "DRIFT",
    "MOUNT", "SHOOT", "FLUSH", "SCOUR", "TROOP",
    "VIXEN", "QUOTA", "PLUNK", "SWING", "FROND",
    "WREST", "QUASH", "TROVE", "GRIMY", "PLUCK",
    "FUDGE", "THROB", "WHISK", "YIELD", "CLEFT",
    "BROIL", "BLAZE", "FLEET", "SHRUB", "SNORT",
    "CRIMP", "WHELK", "SPANG", "TROUT", "SNIPE",
    "GLOAT", "SCOFF", "QUELL", "BRINE", "FRISK",
    "HOVEL", "BRASH", "DROLL", "SWEEP", "PLUMP",
    "CRAVE", "SLOTH", "SPINE", "WREAK", "TINCT",
    "BRUSH", "FENCE", "GRIND", "VAULT", "PRUNE",
    "SLANT", "TRUCE", "GRAFT", "PLUMB", "SWOOP",
    "SHOVE", "THRUM", "FUDGE", "BRISK", "CLAMP",
    "GRIME", "STOMP", "SWISH", "QUELL", "BLIMP",
    "FROCK", "CRUSH", "PLUMB", "TWANG", "SCALD",
    "BROIL", "WREAK", "GLAZE", "SCUFF", "VAUNT",
  ];

  WORD_LIST_VERSION = 'v1.0.0.1'; // Change this when updating words

  currentWordIndex = 0;
  correctWord = this.wordList[this.currentWordIndex];
  canGoNext = false; // Initially, "Next" button is disabled

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
  deviceId = '';

  constructor() {
    this.deviceId = this.getDeviceId(); // Generate device ID
  }

  ngOnInit() {
    const savedWordIndex = localStorage.getItem('lastPlayedWordIndex');
    if (savedWordIndex !== null) {
      this.currentWordIndex = parseInt(savedWordIndex, 10); // Convert string to number
    }

    document.addEventListener('dblclick', function (event) {
      event.preventDefault(); // Prevents zooming
    });
    const storedVersion = localStorage.getItem('wordle-wordlist-version');

    if (storedVersion !== this.WORD_LIST_VERSION) {
      // If version changes, reset progress
      localStorage.setItem('wordle-wordlist-version', this.WORD_LIST_VERSION);
      localStorage.removeItem(`wordle-game-${this.deviceId}`);
      this.currentWordIndex = 0; // Start fresh
    } else {
      this.loadGameState();
    }
  }

  getDeviceId(): string {
    let storedId = localStorage.getItem('deviceId');
    if (!storedId) {
      storedId = 'dev-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', storedId);
    }
    return storedId;
  }

  saveGameState() {
    const gameState = {
      grid: this.grid,
      keyboard: this.keyboard,
      message: this.message,
      currentRow: this.currentRow,
      currentCol: this.currentCol,
      canGoNext: this.canGoNext,
    };
    localStorage.setItem(
      `wordle-game-${this.deviceId}-word-${this.currentWordIndex}`,
      JSON.stringify(gameState)
    );

    localStorage.setItem('lastPlayedWordIndex', this.currentWordIndex.toString()); // ✅ Store latest word index
  }

  loadGameState() {
    const savedState = localStorage.getItem(
      `wordle-game-${this.deviceId}-word-${this.currentWordIndex}`
    );

    if (savedState) {
      const { grid, keyboard, message, currentRow, currentCol, canGoNext } =
        JSON.parse(savedState);
      this.grid = grid;
      this.keyboard = keyboard;
      this.message = message;
      this.currentRow = currentRow;
      this.currentCol = currentCol;
      this.canGoNext = canGoNext; // Restore next button state
    } else {
      this.resetBoard();
    }
  }

  onKeyPress(key: { letter: string; status: string }) {
    if (this.currentCol < 5) {
      this.grid[this.currentRow][this.currentCol] = {
        letter: key.letter,
        status: '',
      };
      this.currentCol++;
      this.saveGameState(); // Save game state
    }
  }

  onBackspace() {
    if (this.currentCol > 0) {
      this.currentCol--;
      this.grid[this.currentRow][this.currentCol] = { letter: '', status: '' };
      this.saveGameState(); // Save game state
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
        this.saveGameState(); // Save game state
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
      this.message = '🎉 Correct! You can go to the next word.';
      this.canGoNext = true; // Enable "Next" button
    } else if (this.currentRow === 5) {
      this.message = `❌ Game Over! The word was "${this.correctWord}".`;
      this.canGoNext = true; // Enable "Next" button
    } else {
      this.currentRow++;
      this.currentCol = 0;
      this.message = 'Try again!';
    }

    this.saveGameState();
  }

  nextWord() {
    if (this.currentWordIndex < this.wordList.length - 1) {
      this.currentWordIndex++;
      this.correctWord = this.wordList[this.currentWordIndex];
      this.loadGameState(); // Load stored progress for this word
    }
  }

  prevWord() {
    if (this.currentWordIndex > 0) {
      this.currentWordIndex--;
      this.correctWord = this.wordList[this.currentWordIndex];
      this.loadGameState(); // Load stored progress for this word
    }
  }

  resetBoard() {
    this.grid = Array(6)
      .fill(null)
      .map(() => Array(5).fill({ letter: '', status: '' }));
    this.keyboard = 'QWERTYUIOPASDFGHJKLZXCVBNM'
      .split('')
      .map((letter) => ({ letter, status: '' }));
    this.currentRow = 0;
    this.currentCol = 0;
    this.message = 'Start guessing!';
    this.canGoNext = false; // Disable "Next" button again
    this.saveGameState();
  }

  updateKeyboard(letter: string, status: string) {
    const key = this.keyboard.find((k) => k.letter === letter);
    if (key && key.status !== 'correct') {
      key.status = status;
    }
  }
}
