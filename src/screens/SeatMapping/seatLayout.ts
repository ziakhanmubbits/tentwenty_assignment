import type {Seat as SeatType} from '../../types/seat';

export const LEFT_BLOCK_SIZE = 5;
export const CENTER_BLOCK_SIZE = 14;
export const RIGHT_BLOCK_SIZE = 5;
export const ROW_COUNT = 10;

export const SEAT_PRICES: Record<SeatType['tier'], number> = {
  regular: 50,
  vip: 150,
};

// how many seats really exist on each side per row (the rest is empty space, like Figma)
const LEFT_VISIBLE = [2, 4, 4, 4, 5, 5, 5, 5, 5, 5];
const RIGHT_VISIBLE = [2, 4, 4, 4, 5, 5, 5, 5, 5, 5];

const TOTAL_COLS = LEFT_BLOCK_SIZE + CENTER_BLOCK_SIZE + RIGHT_BLOCK_SIZE;

function isHidden(rowIndex: number, col: number) {
  if (col < LEFT_BLOCK_SIZE) {
    return col < LEFT_BLOCK_SIZE - LEFT_VISIBLE[rowIndex];
  }
  if (col >= LEFT_BLOCK_SIZE + CENTER_BLOCK_SIZE) {
    return col - LEFT_BLOCK_SIZE - CENTER_BLOCK_SIZE >= RIGHT_VISIBLE[rowIndex];
  }
  return false;
}

export function createInitialSeatLayout(): SeatType[][] {
  return Array.from({length: ROW_COUNT}, (_, rowIndex) => {
    const row = rowIndex + 1;
    const isVipRow = row === ROW_COUNT;
    return Array.from({length: TOTAL_COLS}, (__, col) => {
      const occupied = !isVipRow && (row * 5 + col * 3 + Math.floor(col / 2)) % 4 === 0;
      return {
        id: `${row}-${col + 1}`,
        row: String(row),
        number: col + 1,
        status: occupied ? 'occupied' : 'available',
        tier: isVipRow ? 'vip' : 'regular',
        hidden: isHidden(rowIndex, col),
      };
    });
  });
}