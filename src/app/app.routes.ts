import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { WordleComponent } from './wordle/wordle.component';
import { SudokuComponent } from './sudoku/sudoku.component';
import { RuleComponent } from './rule/rule.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'wordle', component: WordleComponent },
  { path: 'sudoku', component: SudokuComponent },
  { path: 'rules', component: RuleComponent },
];
