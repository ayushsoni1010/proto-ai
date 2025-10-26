import { formatFileSize, formatDate, formatRelativeTime, formatImageDimensions } from '../format';

describe('format utilities', () => {
  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan 1, 2024/);
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative time correctly', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1m ago');
    });
  });

  describe('formatImageDimensions', () => {
    it('should format dimensions correctly', () => {
      expect(formatImageDimensions(1920, 1080)).toBe('1920 × 1080');
      expect(formatImageDimensions()).toBe('Unknown dimensions');
    });
  });
});
