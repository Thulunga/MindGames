import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rule',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rule.component.html',
  styleUrls: ['./rule.component.css'],
})
export class RuleComponent { }
