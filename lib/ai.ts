import { Category, Listing } from './types';

const keywordMap: Record<Category, string[]> = {
  IT: ['разработчик', 'developer', 'frontend', 'backend', 'программист', 'it'],
  Маркетинг: ['маркетолог', 'реклама', 'marketing', 'smm', 'трафик'],
  Продажи: ['продажи', 'sales', 'менеджер', 'клиент', 'торговля'],
  Медицина: ['врач', 'медсестра', 'клиника', 'медицина', 'терапевт'],
  Строительство: ['стройка', 'инженер', 'архитектор', 'прораб', 'дизайн']
};

export function aiSuggestCategory(input: string): Category {
  const normalized = input.toLowerCase();
  for (const [category, words] of Object.entries(keywordMap) as [Category, string[]][]) {
    if (words.some((word) => normalized.includes(word))) {
      return category;
    }
  }
  return 'IT';
}

export function aiGenerateDescription(title: string): string {
  return `AI-описание: Вакансия/Резюме "${title}". Позиция требует релевантного опыта и ключевых навыков. Рекомендуем указать подробности о стеке технологий, условиях работы или ключевых достижениях.`;
}

export function aiModerateListing(text: string): { approved: boolean; reason: string } {
  const bannedWords = ['скам', 'обман', 'крипта', 'быстрый заработок'];
  const found = bannedWords.find((word) => text.toLowerCase().includes(word));
  if (found) {
    return { approved: false, reason: `Найдено подозрительное слово или тема: ${found}` };
  }
  return { approved: true, reason: 'Контент прошел AI-модерацию и соответствует правилам размещения.' };
}

export function aiRecommend(listingPool: Listing[], city: string, favorites: string[]): Listing[] {
  return listingPool
    .map((listing) => ({
      listing,
      score: listing.aiScore + (listing.city === city ? 6 : 0) + (favorites.includes(listing.category) ? 10 : 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => entry.listing);
}
