# Wordle

초등학생용 Wordle 게임 (iOS)

## Stack

- Expo 52 + React Native 0.77 + TypeScript
- React Native Reanimated (애니메이션)
- expo-av (사운드), expo-haptics (햅틱)
- AsyncStorage (통계/데일리 저장)
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

- `app/` — expo-router screens (index, game, stats)
- `components/` — React Native UI components
- `hooks/` — useWordle, useSound, useStats, useDailyWord
- `services/` — storage, sound, share, daily-word
- `constants/` — colors, layout, animations
- `src/` — Platform-independent (types, data, lib, tests)

## Deployment

EAS Build → TestFlight → App Store
