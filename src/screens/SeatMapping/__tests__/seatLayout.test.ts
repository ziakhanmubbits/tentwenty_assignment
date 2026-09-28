import {createInitialSeatLayout, OCCUPIED_SEAT_IDS, ROWS, SEATS_PER_ROW} from '../seatLayout';

describe('createInitialSeatLayout', () => {
  it('creates one row per configured row label, each with the configured seat count', () => {
    const layout = createInitialSeatLayout();

    expect(layout).toHaveLength(ROWS.length);
    layout.forEach((row, index) => {
      expect(row).toHaveLength(SEATS_PER_ROW);
      row.forEach(seat => expect(seat.row).toBe(ROWS[index]));
    });
  });

  it('produces unique, well-formed seat ids', () => {
    const layout = createInitialSeatLayout();
    const ids = layout.flat().map(seat => seat.id);

    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach(id => expect(id).toMatch(/^[A-Z]\d+$/));
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

  it('never marks a seat as selected initially', () => {
    const layout = createInitialSeatLayout();
    expect(layout.flat().some(seat => seat.status === 'selected')).toBe(false);
  });

  it('is deterministic across calls', () => {
    expect(createInitialSeatLayout()).toEqual(createInitialSeatLayout());
  });
});
