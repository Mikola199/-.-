'use client';

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';

export default function SoundGenPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [freqRange, setFreqRange] = useState({ min: 100, max: 2000 });
  const [autoMode, setAutoMode] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playRandomSound = () => {
    initAudio();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const types: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle'];
    osc.type = types[Math.floor(Math.random() * types.length)];

    const freq = Math.random() * (freqRange.max - freqRange.min) + freqRange.min;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  useEffect(() => {
    if (autoMode) {
      const scheduleNext = () => {
        const delay = Math.random() * 1500 + 500;
        timerRef.current = setTimeout(() => {
          playRandomSound();
          scheduleNext();
        }, delay);
      };
      scheduleNext();
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoMode, freqRange, volume]);

  return (
    <main className="container">
      <Header />
      <section className="panel">
        <h1>Генератор рандомных звуков</h1>
        <p className="muted">Приложение для генерации случайных звуковых эффектов с использованием Web Audio API.</p>

        <div style={{ display: 'grid', gap: '1.5rem', marginTop: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={playRandomSound} style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
              🔊 Воспроизвести звук
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoMode}
                onChange={(e) => setAutoMode(e.target.checked)}
              />
              Авто-режим
            </label>
          </div>

          <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
            <label>
              Громкость: {Math.round(volume * 100)}%
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={{ width: '100%', display: 'block', marginTop: '0.5rem' }}
              />
            </label>

            <label>
              Мин. частота: {freqRange.min} Гц
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={freqRange.min}
                onChange={(e) => setFreqRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                style={{ width: '100%', display: 'block', marginTop: '0.5rem' }}
              />
            </label>

            <label>
              Макс. частота: {freqRange.max} Гц
              <input
                type="range"
                min="1000"
                max="5000"
                step="100"
                value={freqRange.max}
                onChange={(e) => setFreqRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                style={{ width: '100%', display: 'block', marginTop: '0.5rem' }}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2>О приложении</h2>
        <p>
          Это приложение использует <code>OscillatorNode</code> из Web Audio API для создания звуковых волн различной формы (sine, square, sawtooth, triangle).
          Каждый раз, когда генерируется звук, выбирается случайная частота в заданном диапазоне и случайный тип волны.
        </p>
      </section>
    </main>
  );
}
