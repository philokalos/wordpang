# Architecture — WordPop

## 개요

Expo 52 + React Native 0.76 기반 iOS 영어 단어 학습 앱. expo-router v4 파일 기반 라우팅, 완전 오프라인 아키텍처.

## 시스템 구조

```
┌─────────────────────────────────────────────┐
│                 Screens (app/)               │
│  index │ game │ stats │ review │ practice    │
├─────────────────────────────────────────────┤
│              Components (28개)               │
│  Core: GameBoard, Keyboard, HintPanel       │
│  Cards: FlashCard, WordCard, DifficultyCard │
│  Sketchy: SketchyBox, SketchyButton,        │
│           PaperBackground, DoodleDecoration │
├─────────────────────────────────────────────┤
│              Hooks (10개)                    │
│  useWordle │ useStats │ useReview │ ...     │
├─────────────────────────────────────────────┤
│             Services (7개)                   │
│  storage │ spaced-repetition │ achievements │
│  sound │ daily-word │ share │ backup        │
├─────────────────────────────────────────────┤
│            Data Layer                        │
│  AsyncStorage (wordpop_ prefix)             │
│  Word Data (360 words × 3 difficulties)     │
└─────────────────────────────────────────────┘
```

## 레이어 구조

### Layer 1: Screens (app/)
expo-router 파일 기반 라우팅. 각 화면은 hooks와 components를 조합.

| 화면 | 파일 | 사용 훅 |
|------|------|---------|
| 홈 | `index.tsx` | useStats, useDailyWord, useOnboarding |
| 게임 | `game.tsx` | useWordle, useSound, useStats, useLearnedWords, useAchievements |
| 통계 | `stats.tsx` | useStats |
| 복습 | `review.tsx` | useReview, useLearnedWords |
| 연습 | `practice.tsx` | usePracticeSession, useWordle |
| 온보딩 | `onboarding.tsx` | useOnboarding |
| 레이아웃 | `_layout.tsx` | useFonts (Gaegu), SplashScreen |

### Layer 2: Components (28개)

**게임 핵심 (7개)**
- `GameBoard` — 추측 그리드 표시
- `GameRow` — 한 줄의 글자 타일
- `LetterTile` — 개별 글자 (색상 상태 반영)
- `Keyboard` — 화면 키보드 (상태 색상)
- `HintPanel` — 8가지 힌트 선택/표시
- `ResultModal` — 승리/패배 결과
- `ShareButton` — 결과 공유

**학습 (4개)**
- `FlashCard` — 복습 플래시카드
- `WordCard` — 학습 카드 (뜻, 발음, 예문)
- `ReviewList` — 복습 큐 목록
- `SessionSummary` — 연습 세션 결과

**선택/표시 (5개)**
- `DifficultyCard` — 난이도 선택
- `CategoryChip` — 카테고리 필터
- `CategoryProgress` — 카테고리별 진도
- `StatsDisplay` — 통계 그래프
- `AchievementBadge` — 업적 배지

**Sketchy 디자인 (4개)**
- `PaperBackground` — 도트 그리드 배경
- `SketchyBox` — SVG 손그림 테두리
- `SketchyButton` — 손그림 버튼
- `DoodleDecoration` — 장식 요소

**기타 (8개)**
- `Header`, `BackupPanel`, `DifficultyPrompt`, `ErrorBoundary` 등

### Layer 3: Hooks (10개)

| 훅 | 책임 | 의존성 |
|----|------|--------|
| useWordle | 게임 핵심 로직 (추측, 평가, 타이머) | storage, word data |
| useStats | 게임 통계 CRUD | storage |
| useReview | 간격 반복 복습 스케줄링 | storage, spaced-repetition |
| useLearnedWords | 학습 완료 단어 관리 | storage |
| useAchievements | 업적 해금 체크 | storage, achievements |
| usePracticeSession | 연습 세션 타이머/관리 | useWordle |
| useSound | 사운드 재생 + 햅틱 | expo-av, expo-haptics |
| useDailyWord | 일일 단어 모드 | storage, daily-word |
| useSketchyStyle | 안정적 랜덤 스타일 생성 | seededRandom |
| useOnboarding | 첫 실행 가이드 | storage |

### Layer 4: Services (7개)

| 서비스 | 역할 |
|--------|------|
| storage.ts | AsyncStorage 래퍼 (직렬화/역직렬화) |
| spaced-repetition.ts | 간격 반복 알고리즘 (30min × 2^n) |
| achievements.ts | 21개 업적 조건 체크 |
| daily-word.ts | 일일 단어 선택 알고리즘 |
| sound.ts | expo-av 오디오 로딩/재생 |
| share.ts | 게임 결과 공유 |
| backup.ts | 데이터 백업/복원 |

### Layer 5: Domain (src/)

**Types (5개)**
- `game.ts` — Difficulty, GameState, HintType, DIFFICULTY_CONFIG
- `word.ts` — WordCategory, WordEntry
- `achievement.ts` — Achievement, ACHIEVEMENT_DEFS (21개)
- `learned.ts` — LearnedWord
- `review.ts` — ReviewEntry, ReviewStatus

**Data**
- `easy-words.ts` — 4글자 단어 120개
- `normal-words.ts` — 5글자 단어 120개
- `hard-words.ts` — 6글자 단어 120개
- `valid-words-*.ts` — 유효 추측 단어 목록 (사전 기반)

**Lib**
- 게임 로직 유틸리티 (글자 평가, 단어 검증 등)

## 데이터 흐름

```
사용자 입력 → useWordle (상태 관리)
  → 추측 평가 (lib/evaluate)
  → 타일 색상 + 키보드 상태 업데이트
  → 게임 종료 시:
    → useStats (통계 저장)
    → useLearnedWords (학습 단어 추가)
    → useAchievements (업적 체크)
    → useReview (복습 큐 추가)
```

## 데이터 영속성

AsyncStorage 기반 완전 로컬 저장. 서버 없음.

| 키 | 데이터 타입 | 용도 |
|----|-----------|------|
| wordpop_stats | GameStats | 승률, 연속기록, 분포 |
| wordpop_daily_state | DailyState | 일일 모드 상태 |
| wordpop_learned_words | LearnedWord[] | 학습 완료 단어 |
| wordpop_review_entries | ReviewEntry[] | 복습 스케줄 |
| wordpop_achievements | Achievement[] | 해금 업적 |
| wordpop_played_categories | string[] | 플레이한 카테고리 |

## 디자인 시스템 — Sketchy

```
constants/theme.ts
  ├── SKETCHY_FONTS (Gaegu Regular/Bold)
  ├── SKETCHY_RADIUS (불규칙 모서리)
  ├── CRAYON (크레용 색상 팔레트)
  └── WOBBLE (미세 기울기)

constants/colors.ts
  └── CRAYON 기반 UI 색상 매핑

utils/sketchy.ts
  ├── seededRandom() — mulberry32 알고리즘
  ├── wobbly rect SVG — 불규칙 테두리 생성
  └── star/squiggle paths — 장식 SVG

hooks/useSketchyStyle.ts
  └── 시드 기반 안정적 랜덤 스타일
```

### 성능 전략
- **고빈도 컴포넌트** (LetterTile, Keyboard): CSS 스타일만 → 60fps
- **저빈도 컨테이너** (모달, 카드): SVG 기반 SketchyBox → 시각 효과 극대화
- **Reanimated**: 타일 뒤집기, 흔들기 애니메이션

## 배포 파이프라인

```
코드 변경 → ESLint + TypeScript 검증
  → Jest 테스트 (399 tests)
  → EAS Build (preview / production)
  → TestFlight (내부 테스트)
  → App Store 제출
```

## 기술 제약

| 제약 | 설명 |
|------|------|
| Expo SDK 52 동결 | 업그레이드는 /migration 스킬만 |
| iOS 전용 | Android 미지원 |
| 오프라인 전용 | 서버 연동 없음 |
| AsyncStorage 6MB | 로컬 저장 용량 제한 |
| iPhone 전용 | supportsTablet: false |
