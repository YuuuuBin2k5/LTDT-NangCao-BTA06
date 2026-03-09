import { formatReviewTimestamp } from '../format.utils';

describe('formatReviewTimestamp', () => {
  beforeEach(() => {
    // Mock current date to ensure consistent test results
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-07T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('formats recent timestamps as relative time (< 30 days)', () => {
    // 2 hours ago
    const twoHoursAgo = new Date('2026-03-07T10:00:00Z').toISOString();
    const result = formatReviewTimestamp(twoHoursAgo);
    expect(result).toContain('giờ trước'); // Vietnamese: "hours ago"
  });

  it('formats old timestamps as absolute date (>= 30 days)', () => {
    // 31 days ago
    const oldDate = new Date('2026-02-04T12:00:00Z').toISOString();
    const result = formatReviewTimestamp(oldDate);
    // Should contain month, day, and year (format varies by locale)
    expect(result).toBeTruthy();
    expect(result).not.toBe('Invalid date');
    expect(result).toContain('2026');
    expect(result).toContain('Feb');
  });

  it('handles invalid timestamps gracefully', () => {
    expect(formatReviewTimestamp('invalid-date')).toBe('Invalid date');
    expect(formatReviewTimestamp('')).toBe('Invalid date');
  });

  it('accepts Date objects as input', () => {
    const date = new Date('2026-03-07T10:00:00Z');
    const result = formatReviewTimestamp(date);
    expect(result).toContain('giờ trước');
  });

  it('handles edge case at exactly 30 days', () => {
    // Exactly 30 days ago
    const thirtyDaysAgo = new Date('2026-02-05T12:00:00Z').toISOString();
    const result = formatReviewTimestamp(thirtyDaysAgo);
    // Should use absolute date format
    expect(result).toBeTruthy();
    expect(result).not.toBe('Invalid date');
    expect(result).toContain('2026');
    expect(result).toContain('Feb');
  });

  it('supports custom locale parameter', () => {
    const oldDate = new Date('2026-01-15T12:00:00Z').toISOString();
    const result = formatReviewTimestamp(oldDate, 'en-US');
    // Should format in English
    expect(result).toMatch(/Jan\s+15,\s+2026/);
  });

  it('uses user locale when no locale specified', () => {
    const oldDate = new Date('2026-01-15T12:00:00Z').toISOString();
    const result = formatReviewTimestamp(oldDate);
    // Should contain date components (format depends on system locale)
    expect(result).toBeTruthy();
    expect(result).not.toBe('Invalid date');
  });
});
