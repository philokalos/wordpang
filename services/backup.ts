import AsyncStorage from '@react-native-async-storage/async-storage';

const WORDPOP_PREFIX = 'wordpop_';

export interface BackupSummary {
  totalGames: number;
  learnedWords: number;
  achievements: number;
  exportDate: string;
}

interface BackupData {
  version: number;
  exportDate: string;
  data: Record<string, string>;
}

function isBackupData(value: unknown): value is BackupData {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.version === 'number' &&
    typeof obj.exportDate === 'string' &&
    typeof obj.data === 'object' &&
    obj.data !== null
  );
}

/**
 * Export all wordpop_ prefixed data from AsyncStorage as a JSON string.
 */
export async function exportAllData(): Promise<string> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const wordpopKeys = allKeys.filter((key) => key.startsWith(WORDPOP_PREFIX));

    const pairs = await AsyncStorage.multiGet(wordpopKeys);
    const data: Record<string, string> = {};
    for (const [key, value] of pairs) {
      if (value !== null) {
        data[key] = value;
      }
    }

    const backup: BackupData = {
      version: 1,
      exportDate: new Date().toISOString(),
      data,
    };

    return JSON.stringify(backup, null, 2);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to export data: ${message}`);
  }
}

/**
 * Import data from a JSON string backup, writing all entries to AsyncStorage.
 * Returns true on success, false on failure.
 */
export async function importAllData(jsonString: string): Promise<boolean> {
  try {
    const parsed: unknown = JSON.parse(jsonString);

    if (!isBackupData(parsed)) {
      throw new Error('Invalid backup format');
    }

    const entries = Object.entries(parsed.data);

    // Validate all keys have the wordpop_ prefix
    for (const [key] of entries) {
      if (!key.startsWith(WORDPOP_PREFIX)) {
        throw new Error(`Invalid key found: ${key}`);
      }
    }

    // Validate all values are strings
    for (const [, value] of entries) {
      if (typeof value !== 'string') {
        throw new Error('Invalid value type in backup data');
      }
    }

    const kvPairs: Array<[string, string]> = entries.map(([key, value]) => [key, value]);
    await AsyncStorage.multiSet(kvPairs);

    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    void message; // import failed silently
    return false;
  }
}

/**
 * Get a summary of the current app data for display purposes.
 */
export async function getBackupSummary(): Promise<BackupSummary> {
  try {
    const statsRaw = await AsyncStorage.getItem('wordpop_stats');
    const learnedRaw = await AsyncStorage.getItem('wordpop_learned_words');
    const achievementsRaw = await AsyncStorage.getItem('wordpop_achievements');

    let totalGames = 0;
    if (statsRaw) {
      const stats = JSON.parse(statsRaw) as Record<string, unknown>;
      totalGames = typeof stats.totalPlayed === 'number' ? stats.totalPlayed : 0;
    }

    let learnedWords = 0;
    if (learnedRaw) {
      const learned: unknown = JSON.parse(learnedRaw);
      learnedWords = Array.isArray(learned) ? learned.length : 0;
    }

    let achievementCount = 0;
    if (achievementsRaw) {
      const achList: unknown = JSON.parse(achievementsRaw);
      if (Array.isArray(achList)) {
        achievementCount = achList.filter(
          (a) => typeof a === 'object' && a !== null && (a as Record<string, unknown>).unlocked === true,
        ).length;
      }
    }

    return {
      totalGames,
      learnedWords,
      achievements: achievementCount,
      exportDate: new Date().toISOString(),
    };
  } catch {
    return {
      totalGames: 0,
      learnedWords: 0,
      achievements: 0,
      exportDate: new Date().toISOString(),
    };
  }
}
