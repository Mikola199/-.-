import { Category, Listing } from './types';

const keywordMap: Record<Category, string[]> = {
  IT: ['developer', 'программист', 'react', 'python', 'frontend', 'backend', 'разработчик'],
  Продажи: ['продаж', 'sales', 'клиент', 'менеджер', 'торговый'],
  Маркетинг: ['маркетолог', 'marketing', 'smm', 'трафик', 'реклама'],
  Медицина: ['врач', 'терапевт', 'медсестра', 'клиника', 'доктор'],
  Дизайн: ['дизайнер', 'design', 'ux', 'ui', 'художник'],
  Строительство: ['инженер', 'строитель', 'прораб', 'монтажник', 'архитектор']
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
  return `AI-описание вакансии: ${title}. Ищем целеустремленного специалиста. Мы предлагаем конкурентную зарплату, дружный коллектив и возможности для роста.`;
}

export function aiModerateListing(text: string): { approved: boolean; reason: string } {
  const bannedWords = ['крипта', 'пирамида', 'казино'];
  const found = bannedWords.find((word) => text.toLowerCase().includes(word));
  if (found) {
    return { approved: false, reason: `Объявление отклонено. Найдено запрещенное слово: ${found}` };
  }
  return { approved: true, reason: 'Объявление прошло AI-модерацию.' };
}

export function aiRecommend(listingPool: Listing[], city: string, favoriteCategories: string[]): Listing[] {
  return listingPool
    .map((listing) => ({
      listing,
      score: listing.aiScore + (listing.city === city ? 15 : 0) + (favoriteCategories.includes(listing.category) ? 20 : 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => entry.listing);
}
