# Architecture — WordPop

## 개요

Expo 52 기반 iOS 영어 단어 학습 앱. expo-router 파일 기반 라우팅.

## 파일 구조

```
wordle/
  app/
    _layout.tsx      # 루트 레이아웃
    index.tsx        # 홈 화면
    game.tsx         # 게임 화면
    stats.tsx        # 통계 화면
    review.tsx       # 복습 화면
    practice.tsx     # 연습 모드
    onboarding.tsx   # 온보딩
  components/        # React Native UI 컴포넌트
  hooks/             # 커스텀 훅
  services/          # 비즈니스 로직 서비스
  src/
    types/           # TypeScript 타입 정의
    data/            # 단어 데이터셋
    lib/             # 유틸리티
```

## 주요 커스텀 훅

| 훅 | 역할 |
|----|------|
| useWordle | 게임 핵심 로직 |
| useSound | expo-av 사운드 |
| useStats | AsyncStorage 통계 |
| useDailyWord | 일일 단어 모드 |
| useLearnedWords | 학습 완료 단어 관리 |
| useReview | Spaced Repetition 복습 |
| useAchievements | 업적 배지 |
| usePracticeSession | 연습 세션 |

## 데이터 영속성

AsyncStorage에 통계, 학습 기록, 복습 스케줄, 업적 데이터 저장.

## 배포 파이프라인

EAS Build → TestFlight → App Store
