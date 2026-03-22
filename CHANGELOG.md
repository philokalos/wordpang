# Changelog — WordPang

모든 주목할 만한 변경사항은 이 파일에 기록됩니다.
상세 릴리즈 노트: [docs/release-notes.md](docs/release-notes.md)

## [Unreleased]

## [3.1.0] — 2026-03-11

### feat
- Sketchy 손그림 디자인 시스템 전면 적용
- Gaegu 폰트 (한국어+영어 손글씨체)
- PaperBackground, SketchyBox, SketchyButton, DoodleDecoration 컴포넌트
- 크레용 색상 팔레트

### chore
- react-native-svg 15.8.0 추가
- expo-splash-screen ~0.29.24 추가

## [3.0.0] — 2026-03-10

### feat
- WordPang 최초 출시
- Expo SDK 52 + React Native 0.76 기반 리빌드
- expo-router v4 파일 기반 라우팅
- 8가지 단어 카테고리 시스템 (animal, food, school, nature, body, home, action, feeling)
- 3단계 난이도: Easy(4자), Normal(5자), Hard(6자)
- 360개 단어 데이터셋 (난이도별 120개, 카테고리별 균등 배분)
- 8가지 힌트 시스템 (포인트 기반, 게임당 4pt)
- 학습 카드 (뜻, 발음, 예문, 품사)
- Spaced Repetition 복습 서비스 (30min × 2^n)
- 21개 업적 배지 시스템
- 연습 모드 (5~10분 세션)
- 일일 단어 모드
- 적응형 난이도 제안
- 사운드 효과 5종 (expo-av)
- 햅틱 피드백 (expo-haptics)
- 온보딩 화면
- 데이터 백업/복원
- 접근성 라벨 (9개 컴포넌트)

### chore
- Jest + React Testing Library 테스트 환경 (399 tests, 30 suites)
- ESLint v9 flat config (0 warnings)
- TypeScript strict 모드 (0 errors)
- EAS Build 설정 (development, preview, production)
- `wordpang_` 스토리지 키 프리픽스 마이그레이션
