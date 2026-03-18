# Release Notes — WordPop

## v3.1.0 — Sketchy Design System (2026-03-11)

### 새로운 기능
- **손그림 디자인 시스템**: 초등학생 친화적인 크레용/손그림 스타일 UI 전면 적용
- **Gaegu 폰트**: 한국어+영어 손글씨 폰트 도입 (Regular, Bold)
- **PaperBackground**: 도트 그리드 노트 배경
- **SketchyBox / SketchyButton**: 불규칙한 SVG 손그림 테두리 컴포넌트
- **DoodleDecoration**: 별, 구불구불 선 등 장식 요소
- **크레용 색상 팔레트**: green, orange, red, blue, purple, yellow, pink 기반 UI 색상

### 개선
- 고빈도 컴포넌트(LetterTile, Keyboard)는 스타일 변경만 적용하여 60fps 유지
- 저빈도 컨테이너(모달, 카드)에 SketchyBox/SketchyButton 래퍼 적용
- 모든 5개 화면에 PaperBackground 적용

### 의존성 추가
- react-native-svg 15.8.0
- expo-splash-screen ~0.29.24

---

## v3.0.0 — WordPop Rebrand & Feature Complete (2026-03-10)

### 주요 변경
- **리브랜딩**: "Wordle" → "WordPop"으로 명칭 변경
- **스토리지 마이그레이션**: `wordle_` → `wordpop_` 키 프리픽스 자동 전환
- **Expo SDK 52**: React Native 0.76 기반 전면 리빌드
- **expo-router v4**: 파일 기반 라우팅 도입

### 새로운 기능

#### 카테고리 시스템
- 8가지 단어 카테고리: animal, food, school, nature, body, home, action, feeling
- 카테고리별 필터링, 진도 추적
- 난이도별 120개 × 3단계 = 총 360개 단어

#### 학습 기능
- **학습 카드**: 게임 종료 후 단어의 뜻, 발음, 예문, 품사 표시
- **간격 반복 복습**: 30분 × 2^n 과학적 복습 스케줄
- **복습 상태 추적**: new → learning → mastered
- **연습 모드**: 5~10분 집중 학습 세션

#### 동기 부여
- **21개 업적 배지**: 연속기록, 단어 학습, 카테고리 마스터 등
- **적응형 난이도**: 승률 기반 자동 난이도 추천
- **일일 단어 모드**: 매일 새로운 단어 도전

#### 힌트 시스템 확장
- 8가지 힌트 유형 (기존 5 → 8)
- 포인트 기반 시스템 (게임당 최대 4포인트)
- pronunciation, rhyming, wordFamily 힌트 추가

#### 사운드 & 햅틱
- 5가지 효과음: pop, flip, win, lose, shake (expo-av)
- 정답/오답 시 햅틱 피드백 (expo-haptics)

#### 접근성
- 9개 핵심 컴포넌트에 accessibility 라벨/역할/상태 적용

### 온보딩
- 첫 실행 시 가이드 화면 표시

### 인프라
- Jest + React Testing Library 테스트 환경 (399 테스트, 30 스위트)
- 훅 커버리지 89.91%, 전체 커버리지 76.6%
- ESLint v9 (flat config) — 0 warnings
- TypeScript strict 모드 — 0 errors
- EAS Build 설정 (development, preview, production)
- 데이터 백업/복원 기능

---

## 이전 버전

v3.0.0 이전의 초기 Wordle 프로토타입은 별도 저장소에서 관리되었습니다.
