/**
 * Backup Service Tests (DDD Domain Service)
 *
 * Tests for backup/restore functionality:
 * - exportAllData: serializes wordpop_ keys to JSON
 * - importAllData: validates and restores backup JSON
 * - getBackupSummary: summarizes stored app data
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exportAllData, importAllData, getBackupSummary } from '../../services/backup';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  getItem: jest.fn(),
}));

const mockGetAllKeys = AsyncStorage.getAllKeys as jest.MockedFunction<typeof AsyncStorage.getAllKeys>;
const mockMultiGet = AsyncStorage.multiGet as jest.MockedFunction<typeof AsyncStorage.multiGet>;
const mockMultiSet = AsyncStorage.multiSet as jest.MockedFunction<typeof AsyncStorage.multiSet>;
const mockGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;

// ---------------------------------------------------------------------------
// 1. exportAllData
// ---------------------------------------------------------------------------
describe('exportAllData', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return JSON string with version, date, and data fields', async () => {
    mockGetAllKeys.mockResolvedValue(['wordpop_stats']);
    mockMultiGet.mockResolvedValue([['wordpop_stats', '{"totalPlayed":5}']]);

    const result = await exportAllData();
    const parsed = JSON.parse(result);

    expect(parsed).toHaveProperty('version', 1);
    expect(parsed).toHaveProperty('exportDate');
    expect(parsed).toHaveProperty('data');
    expect(typeof parsed.exportDate).toBe('string');
  });

  it('should only include keys starting with wordpop_', async () => {
    mockGetAllKeys.mockResolvedValue([
      'wordpop_stats',
      'wordpop_learned_words',
      'other_key',
      'random_data',
    ]);
    mockMultiGet.mockResolvedValue([
      ['wordpop_stats', '{"totalPlayed":5}'],
      ['wordpop_learned_words', '[]'],
    ]);

    const result = await exportAllData();
    const parsed = JSON.parse(result);

    expect(Object.keys(parsed.data)).toEqual(['wordpop_stats', 'wordpop_learned_words']);
    // getAllKeys returns all, but multiGet should only be called with wordpop_ keys
    expect(mockMultiGet).toHaveBeenCalledWith(['wordpop_stats', 'wordpop_learned_words']);
  });

  it('should return valid JSON that can be parsed', async () => {
    mockGetAllKeys.mockResolvedValue(['wordpop_stats']);
    mockMultiGet.mockResolvedValue([['wordpop_stats', '{"totalPlayed":10}']]);

    const result = await exportAllData();

    expect(() => JSON.parse(result)).not.toThrow();
    const parsed = JSON.parse(result);
    expect(parsed.data['wordpop_stats']).toBe('{"totalPlayed":10}');
  });

  it('should handle empty storage gracefully', async () => {
    mockGetAllKeys.mockResolvedValue([]);
    mockMultiGet.mockResolvedValue([]);

    const result = await exportAllData();
    const parsed = JSON.parse(result);

    expect(parsed.version).toBe(1);
    expect(parsed.data).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// 2. importAllData
// ---------------------------------------------------------------------------
describe('importAllData', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should successfully import valid backup JSON', async () => {
    mockMultiSet.mockResolvedValue(undefined);

    const backup = JSON.stringify({
      version: 1,
      exportDate: '2026-03-11T00:00:00.000Z',
      data: {
        wordpop_stats: '{"totalPlayed":5}',
        wordpop_learned_words: '["apple"]',
      },
    });

    const result = await importAllData(backup);

    expect(result).toBe(true);
    expect(mockMultiSet).toHaveBeenCalledWith([
      ['wordpop_stats', '{"totalPlayed":5}'],
      ['wordpop_learned_words', '["apple"]'],
    ]);
  });

  it('should reject invalid JSON string', async () => {
    const result = await importAllData('not valid json {{{');

    expect(result).toBe(false);
    expect(mockMultiSet).not.toHaveBeenCalled();
  });

  it('should reject JSON without required structure (missing version/data)', async () => {
    const noVersion = JSON.stringify({ exportDate: '2026-03-11', data: {} });
    const result1 = await importAllData(noVersion);
    expect(result1).toBe(false);

    const noData = JSON.stringify({ version: 1, exportDate: '2026-03-11' });
    const result2 = await importAllData(noData);
    expect(result2).toBe(false);

    expect(mockMultiSet).not.toHaveBeenCalled();
  });

  it('should reject data with non-wordpop_ keys', async () => {
    const backup = JSON.stringify({
      version: 1,
      exportDate: '2026-03-11T00:00:00.000Z',
      data: {
        wordpop_stats: '{"totalPlayed":5}',
        malicious_key: 'bad data',
      },
    });

    const result = await importAllData(backup);

    expect(result).toBe(false);
    expect(mockMultiSet).not.toHaveBeenCalled();
  });

  it('should return false on AsyncStorage error', async () => {
    mockMultiSet.mockRejectedValue(new Error('Storage full'));

    const backup = JSON.stringify({
      version: 1,
      exportDate: '2026-03-11T00:00:00.000Z',
      data: {
        wordpop_stats: '{"totalPlayed":5}',
      },
    });

    const result = await importAllData(backup);

    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. getBackupSummary
// ---------------------------------------------------------------------------
describe('getBackupSummary', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return correct counts from storage', async () => {
    mockGetItem.mockImplementation(async (key: string) => {
      switch (key) {
        case 'wordpop_stats':
          return JSON.stringify({ totalPlayed: 42 });
        case 'wordpop_learned_words':
          return JSON.stringify([
            { word: 'apple' },
            { word: 'grape' },
            { word: 'tiger' },
          ]);
        case 'wordpop_achievements':
          return JSON.stringify([
            { id: 'first_win', unlocked: true },
            { id: 'streak_3', unlocked: true },
            { id: 'streak_5', unlocked: false },
          ]);
        default:
          return null;
      }
    });

    const summary = await getBackupSummary();

    expect(summary.totalGames).toBe(42);
    expect(summary.learnedWords).toBe(3);
    expect(summary.achievements).toBe(2);
    expect(summary).toHaveProperty('exportDate');
  });

  it('should return zeros when storage is empty', async () => {
    mockGetItem.mockResolvedValue(null);

    const summary = await getBackupSummary();

    expect(summary.totalGames).toBe(0);
    expect(summary.learnedWords).toBe(0);
    expect(summary.achievements).toBe(0);
  });
});
