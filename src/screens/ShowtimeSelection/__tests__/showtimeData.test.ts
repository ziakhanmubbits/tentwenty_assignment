import {generateDateOptions} from '../showtimeData';

describe('generateDateOptions', () => {
  it('generates the requested number of consecutive dates starting from the given date', () => {
    const options = generateDateOptions(new Date('2026-03-05T00:00:00Z'), 5);

    expect(options).toHaveLength(5);
    expect(options.map(option => option.label)).toEqual([
      '5 Mar',
      '6 Mar',
      '7 Mar',
      '8 Mar',
      '9 Mar',
    ]);
  });

  it('produces unique ids for each date', () => {
    const options = generateDateOptions(new Date('2026-03-05T00:00:00Z'), 5);
    const ids = options.map(option => option.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('rolls over into the next month correctly', () => {
    const options = generateDateOptions(new Date('2026-03-30T00:00:00Z'), 3);
    expect(options.map(option => option.label)).toEqual(['30 Mar', '31 Mar', '1 Apr']);
  });
});
