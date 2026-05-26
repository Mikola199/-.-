const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8002;

app.use(cors());
app.use(express.json());

const listings = [
  {
    id: '1',
    title: 'Tesla Model 3 Long Range 2023',
    description: 'Отличное состояние, автопилот, один владелец, обслуживание у дилера.',
    price: 4290000,
    city: 'Москва',
    category: 'Авто',
    seller: 'Артем',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-12',
    aiScore: 96
  },
  {
    id: '2',
    title: '2-к квартира рядом с метро',
    description: 'Евроремонт, мебель, техника, быстрый выход на сделку.',
    price: 12300000,
    city: 'Санкт-Петербург',
    category: 'Недвижимость',
    seller: 'Ольга',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-10',
    aiScore: 91
  }
];

app.get('/api/listings', (req, res) => {
  res.json({ items: listings });
});

app.post('/api/listings', (req, res) => {
  const item = {
    id: Math.random().toString(36).substr(2, 9),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  listings.push(item);
  res.status(201).json({ item });
});

app.listen(port, () => {
  console.log(`Market Service listening at http://localhost:${port}`);
});
