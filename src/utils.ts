import { InvalidArgumentError } from 'commander';

const AVAILABLE_RATINGS = ['safe', 'suggestive', 'borderline', 'explicit'];

export function calculateLimits(total: number): number[] {
  const limits: number[] = [];
  const maxLimit = 100;

  while (total > 0) {
    if (total > maxLimit) {
      limits.push(maxLimit);
      total -= maxLimit;
    } else {
      limits.push(total);
      break;
    }
  }

  return limits;
}

export function parseRating(value: string, previous: string): string {
  if (!AVAILABLE_RATINGS.includes(value)) {
    throw new InvalidArgumentError('Не существующий рейтинг.');
  }

  return value;
}

export function myParseInt(value: string, previous: number): number {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.');
  }
  return parsedValue;
}
