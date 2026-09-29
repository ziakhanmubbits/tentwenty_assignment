import type {DateOption, Showtime} from '../../types/showtime';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function generateDateOptions(startDate: Date, count: number): DateOption[] {
  return Array.from({length: count}, (_, index) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + index);
    return {
      id: date.toISOString().slice(0, 10),
      label: `${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`,
    };
  });
}

export function formatFullDate(dateId: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateId));
}

export function shortenVenue(venue: string): string {
  const parts = venue.split('+');
  return parts[parts.length - 1].trim();
}

export const MOCK_SHOWTIMES: Showtime[] = [
  {id: '1', time: '12:30', venue: 'Cinetech + Hall 1', priceLabel: 'From 50$ or 2500 bonus'},
  {id: '2', time: '13:30', venue: 'Cinetech + Hall 2', priceLabel: 'From 75$ or 3000 bonus'},
  {id: '3', time: '16:00', venue: 'Cinetech + Hall 1', priceLabel: 'From 50$ or 2500 bonus'},
];
