# WordPop

초등학생용 영어 단어 학습 iOS 앱 — 교육 연구 기반 설계

## 소개

WordPop은 Wordle 방식의 단어 추측 게임을 통해 초등학생이 영어 단어를 자연스럽게 학습할 수 있도록 설계된 앱입니다. 교정 피드백(494% 기억력 향상), 간격 반복(53% 어휘 획득률), Flow Zone Theory 기반 적응형 난이도 등 교육 연구에 근거한 학습 전략을 적용했습니다.

## 주요 기능

- **8가지 단어 카테고리**: animal, food, school, nature, body, home, action, feeling
- **3단계 난이도**: Easy(4글자), Normal(5글자), Hard(6글자)
- **360개 엄선 단어**: 난이도별 120개, 카테고리별 균등 배분
- **학습 카드**: 게임 후 뜻, 발음, 예문, 품사 표시
- **간격 반복 복습**: 과학적 스케줄로 장기 기억 전환
- **8가지 힌트**: 포인트 기반 (예시문, 뜻, 발음, 첫 글자, 모음 수, 글자 위치 등)
- **21개 업적 배지**: 학습 동기 부여
- **연습 모드**: 5~10분 집중 세션
- **일일 단어**: 매일 새로운 도전
- **적응형 난이도**: 승률 기반 자동 추천
- **손그림 디자인**: 크레용/Gaegu 폰트 기반 초등학생 친화 UI
- **사운드 & 햅틱**: 5가지 효과음 + 햅틱 피드백
- **완전 오프라인**: 서버 불필요, 개인정보 수집 없음

## 기술 스택

| 항목 | 버전 |
|------|------|
| Expo SDK | ~52.0.0 |
| React Native | 0.76.9 |
| TypeScript | ~5.6.2 |
| expo-router | ~4.0.0 |
| React Native Reanimated | ~3.16.7 |
| expo-av | ~15.0.2 |
| expo-haptics | ~14.0.1 |
| AsyncStorage | 1.23.1 |
| react-native-svg | 15.8.0 |
| Jest | ^29.7.0 |

## 시작하기

```bash
npm install          # 의존성 설치
npm start            # Expo 개발 서버
npm run ios          # iOS 시뮬레이터
npm test             # 테스트 실행 (399 tests)
npm run lint         # ESLint (--max-warnings 0)
```

## 프로젝트 구조

```
wordle/
  app/               # expo-router 스크린 (6개 화면 + 레이아웃)
  components/         # React Native UI 컴포넌트 (28개)
    sketchy/          # 손그림 디자인 컴포넌트 (4개)
  hooks/              # 커스텀 훅 (10개)
  services/           # 비즈니스 로직 (7개)
  constants/          # 색상, 테마, 레이아웃, 애니메이션
  utils/              # Sketchy 디자인 유틸리티
  src/
    types/            # TypeScript 타입 정의 (5개)
    data/             # 단어 데이터셋 (360 단어 + 유효 단어)
    lib/              # 게임 로직 유틸리티
  assets/
    fonts/            # Gaegu 손글씨 폰트
    sounds/           # 효과음 (5종)
  docs/               # 프로덕트 문서
  store-metadata/     # App Store 메타데이터
```

## 코드 품질

| 지표 | 수치 |
|------|------|
| 테스트 | 399 tests / 30 suites |
| 훅 커버리지 | 89.91% |
| 전체 커버리지 | 76.6% |
| ESLint | 0 warnings |
| TypeScript | 0 errors |
| 접근성 | 9 컴포넌트 a11y 적용 |

## 문서

| 문서 | 설명 |
|------|------|
| [PRD](docs/PRD.md) | 제품 요구사항 문서 |
| [Architecture](docs/architecture.md) | 기술 아키텍처 |
| [User Guide](docs/user-guide.md) | 사용자 가이드 |
| [Release Notes](docs/release-notes.md) | 릴리즈 노트 |
| [App Store Metadata](store-metadata/app-store.md) | 앱 스토어 메타데이터 |
| [CHANGELOG](CHANGELOG.md) | 변경 이력 |

## 배포

```bash
npm run build:preview    # Preview 빌드 (TestFlight)
npm run build:ios        # Production 빌드 (App Store)
```

EAS Build → TestFlight → App Store

## 참고사항

- Expo SDK 버전 동결 (52) — 업그레이드는 `/migration` 스킬을 통해서만
- 의존성 추가 시 `npx expo install <package>` 사용
- iOS 전용 (iPhone), 태블릿 미지원
