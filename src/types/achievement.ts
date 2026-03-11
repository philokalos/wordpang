export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'first_win', title: '첫 승리!', description: '처음으로 단어를 맞혔어요', icon: '🏆' },
  { id: 'streak_3', title: '3일 연속!', description: '3일 연속 게임에 성공했어요', icon: '🔥' },
  { id: 'streak_7', title: '일주일 연속!', description: '7일 연속 게임에 성공했어요', icon: '⚡' },
  { id: 'streak_30', title: '한 달 연속!', description: '30일 연속 게임에 성공했어요', icon: '👑' },
  { id: 'words_10', title: '단어 수집가', description: '10개의 단어를 학습했어요', icon: '📚' },
  { id: 'words_50', title: '단어 박사', description: '50개의 단어를 학습했어요', icon: '🎓' },
  { id: 'words_100', title: '단어 마스터', description: '100개의 단어를 학습했어요', icon: '🌟' },
  { id: 'perfect_guess', title: '천재!', description: '첫 번째 시도에 맞혔어요', icon: '🧠' },
  { id: 'all_categories', title: '탐험가', description: '모든 카테고리를 플레이했어요', icon: '🗺️' },
  { id: 'review_10', title: '복습왕', description: '10번 복습을 완료했어요', icon: '🔄' },
  { id: 'games_10', title: '열정 게이머', description: '10번 게임을 플레이했어요', icon: '🎮' },
  { id: 'games_50', title: '단어 팝 팬', description: '50번 게임을 플레이했어요', icon: '💜' },
  { id: 'no_hints', title: '힌트 없이!', description: '힌트 없이 단어를 맞혔어요', icon: '💪' },
  { id: 'hard_win', title: '어려운 도전', description: 'Hard 모드에서 승리했어요', icon: '🏅' },
  { id: 'daily_first', title: '오늘의 단어', description: '데일리 모드를 처음 클리어했어요', icon: '📅' },
  { id: 'speed_learner', title: '스피드 러너', description: '2번 이내로 맞힌 횟수가 5회예요', icon: '⚡' },
  { id: 'no_hints_10', title: '노힌트 챔피언', description: '힌트 없이 10번 승리했어요', icon: '🧠' },
  { id: 'category_master_animal', title: '동물 박사', description: '동물 카테고리 단어를 모두 학습했어요', icon: '🐾' },
  { id: 'category_master_food', title: '음식 박사', description: '음식 카테고리 단어를 모두 학습했어요', icon: '🍽️' },
  { id: 'consistency', title: '꾸준한 학습자', description: '7일 연속 플레이했어요', icon: '📅' },
  { id: 'review_expert', title: '복습 달인', description: '30개의 단어를 복습했어요', icon: '🔄' },
];
