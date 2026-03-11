/**
 * DDD Domain Model Tests v3.0 (WordPop)
 *
 * v3.0 도메인 모델의 불변식(invariant)과 값 객체(value object) 계약을 검증.
 * - Value Objects: WordCategory, HintType (expanded), ReviewStatus
 * - Domain Invariants: category coverage, hint cost model, achievement definitions
 * - Filtering: category-based word list filtering
 */

import type { WordCategory } from '../types/word';
import type { WordEntry } from '../types/word';
import type { Difficulty, HintType } from '../types/game';
import { HINT_COSTS, MAX_HINT_POINTS } from '../types/game';
import { ACHIEVEMENT_DEFS } from '../types/achievement';
import type { ReviewStatus } from '../types/review';
import { getWordList, getWordListByCategory, getRandomWord } from '../data';

const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];
const categories: WordCategory[] = [
  'animal',
  'food',
  'school',
  'nature',
  'body',
  'home',
  'action',
  'feeling',
];

describe('Domain Model v3: WordCategory value object invariants', () => {
  const difficultyCategory = difficulties.flatMap((d) =>
    categories.map((c) => [d, c] as [Difficulty, WordCategory]),
  );

  it.each(difficultyCategory)(
    'category "%s/%s" should have at least 1 word',
    (difficulty, category) => {
      const { answers } = getWordListByCategory(difficulty, category);
      expect(answers.length).toBeGreaterThanOrEqual(1);
    },
  );

  it.each(difficulties)('all %s answer words should have a valid category', (difficulty) => {
    const { answers } = getWordList(difficulty);

    answers.forEach((entry: WordEntry) => {
      expect(categories).toContain(entry.category);
    });
  });

  it.each(difficulties)(
    'all %s answer words should have a non-empty partOfSpeech',
    (difficulty) => {
      const { answers } = getWordList(difficulty);

      answers.forEach((entry: WordEntry) => {
        expect(entry.partOfSpeech.length).toBeGreaterThan(0);
      });
    },
  );

  it.each(difficulties)(
    'all %s answer words should have a valid partOfSpeech value',
    (difficulty) => {
      const validParts = ['noun', 'verb', 'adjective'];
      const { answers } = getWordList(difficulty);

      answers.forEach((entry: WordEntry) => {
        expect(validParts).toContain(entry.partOfSpeech);
      });
    },
  );
});

describe('Domain Model v3: Category filtering invariants', () => {
  it.each(difficulties)(
    'getWordListByCategory(%s, undefined) should return same answers as getWordList(%s)',
    (difficulty) => {
      const unfiltered = getWordList(difficulty);
      const withUndefined = getWordListByCategory(difficulty, undefined);

      expect(withUndefined.answers).toEqual(unfiltered.answers);
    },
  );

  it.each(difficulties)(
    'getWordListByCategory(%s, category) should return only words with that category',
    (difficulty) => {
      categories.forEach((category) => {
        const { answers } = getWordListByCategory(difficulty, category);

        answers.forEach((entry: WordEntry) => {
          expect(entry.category).toBe(category);
        });
      });
    },
  );

  it.each(difficulties)(
    'getWordListByCategory(%s) should preserve the validWords set',
    (difficulty) => {
      const unfiltered = getWordList(difficulty);

      categories.forEach((category) => {
        const filtered = getWordListByCategory(difficulty, category);
        expect(filtered.validWords).toBe(unfiltered.validWords);
      });
    },
  );

  it.each(difficulties)(
    'getRandomWord(%s, category) should return a word matching that category',
    (difficulty) => {
      categories.forEach((category) => {
        const word = getRandomWord(difficulty, category);
        expect(word.category).toBe(category);
      });
    },
  );
});

describe('Domain Model v3: HintType exhaustiveness', () => {
  it('should support exactly 8 hint types', () => {
    const hintTypes: HintType[] = [
      'example',
      'firstLetter',
      'vowelCount',
      'meaning',
      'letterPosition',
      'pronunciation',
      'rhyming',
      'wordFamily',
    ];
    expect(hintTypes).toHaveLength(8);
  });

  it('HINT_COSTS should have exactly 8 entries', () => {
    expect(Object.keys(HINT_COSTS)).toHaveLength(8);
  });

  it('HINT_COSTS keys should match the 8 hint types', () => {
    const expectedTypes: HintType[] = [
      'example',
      'firstLetter',
      'vowelCount',
      'meaning',
      'letterPosition',
      'pronunciation',
      'rhyming',
      'wordFamily',
    ];
    expect(Object.keys(HINT_COSTS).sort()).toEqual(expectedTypes.sort());
  });
});

describe('Domain Model v3: Hint cost model invariants', () => {
  it('all hint types should have a cost >= 1', () => {
    Object.values(HINT_COSTS).forEach((cost) => {
      expect(cost).toBeGreaterThanOrEqual(1);
    });
  });

  it('MAX_HINT_POINTS should be >= max individual hint cost', () => {
    const maxCost = Math.max(...Object.values(HINT_COSTS));
    expect(MAX_HINT_POINTS).toBeGreaterThanOrEqual(maxCost);
  });

  it('letterPosition cost should be > meaning cost (progressive disclosure)', () => {
    expect(HINT_COSTS.letterPosition).toBeGreaterThan(HINT_COSTS.meaning);
  });
});

describe('Domain Model v3: Achievement definitions invariants', () => {
  it('should have exactly 21 achievements', () => {
    expect(ACHIEVEMENT_DEFS).toHaveLength(21);
  });

  it('all achievement IDs should be unique', () => {
    const ids = ACHIEVEMENT_DEFS.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all achievements should have non-empty title, description, icon', () => {
    ACHIEVEMENT_DEFS.forEach((achievement) => {
      expect(achievement.title.length).toBeGreaterThan(0);
      expect(achievement.description.length).toBeGreaterThan(0);
      expect(achievement.icon.length).toBeGreaterThan(0);
    });
  });

  it('should have no duplicate titles', () => {
    const titles = ACHIEVEMENT_DEFS.map((a) => a.title);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });
});

describe('Domain Model v3: ReviewStatus type invariants', () => {
  it('ReviewStatus should be one of: new, learning, mastered', () => {
    const validStatuses: ReviewStatus[] = ['new', 'learning', 'mastered'];
    expect(validStatuses).toHaveLength(3);

    // Verify each is assignable (compile-time check via type annotation)
    const s1: ReviewStatus = 'new';
    const s2: ReviewStatus = 'learning';
    const s3: ReviewStatus = 'mastered';

    expect(s1).toBe('new');
    expect(s2).toBe('learning');
    expect(s3).toBe('mastered');
  });
});
