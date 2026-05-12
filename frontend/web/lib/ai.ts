import { Category, Listing } from './types';

const keywordMap: Record<Category, string[]> = {
  Авто: ['авто', 'машин', 'tesla', 'bmw', 'kia', 'toyota'],
  Недвижимость: ['квартира', 'дом', 'ипотека', 'комната', 'апартаменты'],
  Техника: ['ноутбук', 'смартфон', 'macbook', 'айфон', 'камера'],
  Услуги: ['услуга', 'ремонт', 'дизайн', 'репетитор', 'монтаж'],
  Хобби: ['велосипед', 'гитара', 'коллекция', 'настол', 'спорт']
};

export function aiSuggestCategory(input: string): Category {
  const normalized = input.toLowerCase();
  for (const [category, words] of Object.entries(keywordMap) as [Category, string[]][]) {
    if (words.some((word) => normalized.includes(word))) {
      return category;
    }
  }
  return 'Услуги';
}

export function aiGenerateDescription(title: string): string {
  return `AI-описание: ${title}. Товар прошел автоанализ, рекомендован к публикации. Добавьте детали о состоянии, комплектации и сроках доставки.`;
}

export function aiModerateListing(text: string): { approved: boolean; reason: string } {
  const bannedWords = ['скам', 'обман'];
  const found = bannedWords.find((word) => text.toLowerCase().includes(word));
  if (found) {
    return { approved: false, reason: `Найдено подозрительное слово: ${found}` };
  }
  return { approved: true, reason: 'Объявление прошло AI-модерацию.' };
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
