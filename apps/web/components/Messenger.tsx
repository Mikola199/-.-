'use client';

import { useState } from 'react';
import { Message } from '@/lib/types';

export function Messenger() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', senderId: 'u2', text: 'Привет! Есть новости по проекту?', timestamp: '14:20' },
    { id: '2', senderId: 'u1', text: 'Да, почти все готово!', timestamp: '14:21' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'u1',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  return (
    <div className="messenger-ui">
      <div className="messages-list">
        {messages.map((m) => (
          <div key={m.id} className={`message-bubble ${m.senderId === 'u1' ? 'own' : ''}`}>
            <p>{m.text}</p>
            <span>{m.timestamp}</span>
          </div>
        ))}
      </div>
      <div className="messenger-input">
        <input
          placeholder="Напишите сообщение..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Отправить</button>
      </div>
      <style jsx>{`
        .messenger-ui {
          height: 400px;
          display: flex;
          flex-direction: column;
          background: var(--surface);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .messages-list {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .message-bubble {
          max-width: 80%;
          padding: 0.6rem 0.8rem;
          border-radius: 12px;
          background: var(--bg);
          align-self: flex-start;
        }
        .message-bubble.own {
          background: var(--accent);
          color: white;
          align-self: flex-end;
        }
        .message-bubble span {
          font-size: 0.7rem;
          opacity: 0.7;
          display: block;
          text-align: right;
        }
        .messenger-input {
          padding: 1rem;
          display: flex;
          gap: 0.5rem;
          border-top: 1px solid var(--border);
        }
        .messenger-input input {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
