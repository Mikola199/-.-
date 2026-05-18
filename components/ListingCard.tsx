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
          <span className="badge">{listing.type}</span>
          <span>{listing.category}</span>
          <span>AI Match: {listing.aiScore}%</span>
        </div>
        <h3>{listing.title}</h3>
        {listing.company && <p className="company-name"><strong>{listing.company}</strong></p>}
        <p className="description">{listing.description}</p>
        <div className="card-footer">
          <strong>{listing.price.toLocaleString('ru-RU')} ₽</strong>
          <span>{listing.city}</span>
        </div>
        <div className="card-footer">
          <span>Опыт: {listing.experience}</span>
          <span>⭐ {listing.rating}</span>
        </div>
        <div className="card-footer">
          <button type="button" className="ghost-button" onClick={() => onFavorite(listing.id)}>
            В избранное
          </button>
          <button type="button" className="primary-button">
            Откликнуться
          </button>
        </div>
      </div>
    </article>
  );
}
