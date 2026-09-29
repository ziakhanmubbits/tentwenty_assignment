import {
  CENTER_BLOCK_SIZE,
  LEFT_BLOCK_SIZE,
  RIGHT_BLOCK_SIZE,
  ROW_COUNT,
  createInitialSeatLayout,
} from '../seatLayout';

describe('createInitialSeatLayout', () => {
  it('creates the configured number of rows, each with the configured column count', () => {
    const layout = createInitialSeatLayout();

    expect(layout).toHaveLength(ROW_COUNT);
    layout.forEach((row, index) => {
      expect(row).toHaveLength(LEFT_BLOCK_SIZE + CENTER_BLOCK_SIZE + RIGHT_BLOCK_SIZE);
      row.forEach(seat => expect(seat.row).toBe(String(index + 1)));
    });
  });

  it('produces unique, well-formed seat ids', () => {
    const layout = createInitialSeatLayout();
    const ids = layout.flat().map(seat => seat.id);

    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach(id => expect(id).toMatch(/^\d+-\d+$/));
  });

  it('marks the last row as VIP and every other row as regular', () => {
    const layout = createInitialSeatLayout();

    layout.forEach((row, index) => {
      const expectedTier = index + 1 === ROW_COUNT ? 'vip' : 'regular';
      row.forEach(seat => expect(seat.tier).toBe(expectedTier));
    });
  });

  it('never marks the VIP row as occupied or hidden', () => {
    const layout = createInitialSeatLayout();
    const vipRow = layout[ROW_COUNT - 1];
    expect(vipRow.every(seat => seat.status === 'available' && !seat.hidden)).toBe(true);
  });

  it('hides fewer seats on the front rows to form a narrower, theater-shaped block', () => {
    const layout = createInitialSeatLayout();
    const frontRowVisible = layout[0].filter(seat => !seat.hidden).length;
    const backRowVisible = layout[ROW_COUNT - 2].filter(seat => !seat.hidden).length;

    expect(frontRowVisible).toBeLessThan(backRowVisible);
  });

  it('never marks a seat as selected initially', () => {
    const layout = createInitialSeatLayout();
    expect(layout.flat().some(seat => seat.status === 'selected')).toBe(false);
  });

  it('is deterministic across calls', () => {
    expect(createInitialSeatLayout()).toEqual(createInitialSeatLayout());
  });
});
