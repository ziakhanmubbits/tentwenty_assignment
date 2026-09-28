import {
  OCCUPIED_SEAT_IDS,
  ROW_COUNT,
  SEATS_PER_ROW,
  VIP_ROW,
  createInitialSeatLayout,
} from '../seatLayout';

describe('createInitialSeatLayout', () => {
  it('creates the configured number of rows, each with the configured seat count', () => {
    const layout = createInitialSeatLayout();

    expect(layout).toHaveLength(ROW_COUNT);
    layout.forEach((row, index) => {
      expect(row).toHaveLength(SEATS_PER_ROW);
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

    layout.forEach(row => {
      const expectedTier = row[0].row === VIP_ROW ? 'vip' : 'regular';
      row.forEach(seat => expect(seat.tier).toBe(expectedTier));
    });
  });

  it('marks exactly the configured seats as occupied and everything else available', () => {
    const layout = createInitialSeatLayout();

    layout.flat().forEach(seat => {
      if (OCCUPIED_SEAT_IDS.has(seat.id)) {
        expect(seat.status).toBe('occupied');
      } else {
        expect(seat.status).toBe('available');
      }
    });
  });

  it('never marks the VIP row as occupied', () => {
    const layout = createInitialSeatLayout();
    const vipRow = layout.find(row => row[0].row === VIP_ROW)!;
    expect(vipRow.every(seat => seat.status === 'available')).toBe(true);
  });

  it('never marks a seat as selected initially', () => {
    const layout = createInitialSeatLayout();
    expect(layout.flat().some(seat => seat.status === 'selected')).toBe(false);
  });

  it('is deterministic across calls', () => {
    expect(createInitialSeatLayout()).toEqual(createInitialSeatLayout());
  });
});
