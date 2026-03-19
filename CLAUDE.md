# WordPang

초등학생용 영어 단어 학습 앱 (iOS) — 교육 연구 기반

## Stack

- Expo 52 + React Native 0.76 + TypeScript
- React Native Reanimated (애니메이션)
- expo-av (사운드), expo-haptics (햅틱)
- AsyncStorage (통계/데일리/학습/복습 저장)
- expo-router (파일 기반 라우팅)

## Commands

```bash
npm start          # Expo dev server
npm run ios        # iOS 시뮬레이터
npm test           # Jest 테스트
npm run test:watch # Jest watch mode
npm run lint       # ESLint (--max-warnings 0)
npm run build:ios  # EAS Build (production)
```

## Structure

- `app/` — expo-router screens (index, game, stats, review, practice)
- `components/` — React Native UI components
- `hooks/` — useWordle, useSound, useStats, useDailyWord, useLearnedWords, useReview, useAchievements, usePracticeSession
- `services/` — storage, sound, share, daily-word, spaced-repetition, achievements
- `constants/` — colors, layout, animations
- `src/` — Platform-independent (types, data, lib, tests)
  - `src/types/` — game, word (with categories), learned, review, achievement
  - `src/data/` — word lists (easy/normal/hard with 8 categories)

## Key Features

- 8 word categories: animal, food, school, nature, body, home, action, feeling
- Learning cards with corrective feedback (494% memory improvement)
- Spaced repetition review (53% vocabulary acquisition)
- Adaptive difficulty suggestion (flow zone theory)
- 15 achievement badges (competence motivation)
- Practice mode (5-10 min sessions)
- 5 hint types (example, firstLetter, vowelCount, meaning, letterPosition)
- Daily word mode

## Deployment

EAS Build → TestFlight → App Store
