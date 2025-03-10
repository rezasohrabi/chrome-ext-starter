export interface SnoozeOption {
  id: string;
  label: string;
  hours?: number;
  days?: number;
  custom?: boolean;
  calculateTime?: () => number;
}

export interface SnoozedTab {
  id: number;
  url?: string;
  title?: string;
  favicon?: string;
  createdAt: number;
  wakeTime: number;
}
