import { goals } from '@/shared/constants/goals';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  getGoals(max?: number) {
    return max ? goals.slice(0, max) : (goals ?? []);
  }

  getGoal(id: number) {
    return goals.find((goal) => goal.id === id);
  }
}
