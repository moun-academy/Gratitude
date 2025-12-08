export const REMINDER_LINES: string[] = [
  "Take a deep breath and notice one thing you're grateful for right now.",
  "A gentle nudge: jot down a moment that made you smile today.",
  "Your kindness counts. Capture a small win or warm memory.",
  "Pause for a second: what sparked joy recently?", 
  "Gratitude grows when you name it—write one bright spot." 
];

export function getRotatingReminder(index: number): string {
  return REMINDER_LINES[index % REMINDER_LINES.length];
}
