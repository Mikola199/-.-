import Image from 'next/image';
import { Listing } from '@/lib/types';

interface Props {
  listing: Listing;
  onFavorite: (id: string) => void;
}

export function ListingCard({ listing, onFavorite }: Props) {
  return (
    <article className="card">
      <div className="media-wrap">
        <Image src={listing.image} alt={listing.title} width={800} height={500} className="media" />
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span>{listing.category}</span>
          <span>AI score: {listing.aiScore}</span>
        </div>
        <h3>{listing.title}</h3>
        <p>{listing.description}</p>
        <div className="card-footer">
          <strong>{listing.price.toLocaleString('ru-RU')} ₽</strong>
          <span>{listing.city}</span>
        </div>
        <div className="card-footer">
          <span>⭐ {listing.rating}</span>
          <button type="button" className="ghost-button" onClick={() => onFavorite(listing.id)}>
            В избранное
          </button>
        </div>
      </div>
    </article>
  );
}
