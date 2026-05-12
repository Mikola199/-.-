'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'Me',
      text: inputText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <main className="container">
      <Header />
      <section className="panel">
        <h2>Messenger</h2>
        <div className="chat-window" style={{ height: '400px', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px', overflowY: 'auto' }}>
          {messages.length === 0 ? (
            <p className="muted">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: '12px' }}>
                <strong>{msg.sender}</strong> <small className="muted">{msg.timestamp}</small>
                <p>{msg.text}</p>
              </div>
            ))
          )}
        </div>
        <div className="filters" style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </section>
    </main>
  );
}
