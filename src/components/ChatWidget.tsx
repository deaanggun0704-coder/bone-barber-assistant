import { ArrowUp, Bot, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getFaqAnswer } from '../data/faq';

type Message = { id: number; sender: 'bot' | 'user'; text: string };
const welcome = 'Halo! Saya Bone Barber Assistant. Saya siap membantu informasi layanan, harga, reservasi, dan lokasi Bone Barber Shop.';
const quickReplies = ['Daftar layanan', 'Harga potong rambut', 'Jam buka', 'Lokasi kami', 'Cara reservasi', 'Hitung jarak'];
const maxLength = 500;

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([{ id: 1, sender: 'bot', text: welcome }]);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);
  const responseTimeout = useRef<number | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, processing]);

  useEffect(() => () => {
    if (responseTimeout.current !== null) window.clearTimeout(responseTimeout.current);
  }, []);

  function sendMessage(raw: string) {
    const text = raw.trim();
    if (!text || text.length > maxLength || processing) return;
    setInput('');
    setMessages((current) => [...current, { id: nextId.current++, sender: 'user', text }]);
    setProcessing(true);
    responseTimeout.current = window.setTimeout(() => {
      const answer = getFaqAnswer(text);
      setMessages((current) => [...current, { id: nextId.current++, sender: 'bot', text: answer }]);
      setProcessing(false);
      responseTimeout.current = null;
    }, 350);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  function clearConversation() {
    if (responseTimeout.current !== null) {
      window.clearTimeout(responseTimeout.current);
      responseTimeout.current = null;
    }
    setMessages([{ id: nextId.current++, sender: 'bot', text: welcome }]);
    setInput('');
    setProcessing(false);
  }

  return (
    <section className="chat-card" aria-label="Chat Bone Barber Assistant">
      <div className="chat-topbar">
        <span className="bot-avatar"><Bot size={19} /></span>
        <div className="chat-identity"><strong>Bone Assistant</strong><span><i /> Siap membantu</span></div>
        <button className="icon-button" onClick={clearConversation} title="Hapus percakapan" aria-label="Hapus percakapan"><RotateCcw size={17} /></button>
      </div>
      <div className="chat-messages" ref={scrollRef} aria-live="polite">
        <div className="chat-date"><span>Percakapan dimulai</span></div>
        {messages.map((message) => (
          <div className={`message-row ${message.sender}`} key={message.id}>
            {message.sender === 'bot' && <span className="message-avatar"><Bot size={14} /></span>}
            <div className="message-content">
              <p className="message-bubble">{message.text}</p>
              {message.sender === 'bot' && message.text.includes('halaman Reservasi') && <Link className="chat-action-link" to="/reservasi">Isi formulir reservasi</Link>}
            </div>
          </div>
        ))}
        {processing && <div className="message-row bot"><span className="message-avatar"><Bot size={14} /></span><div className="message-bubble typing" aria-label="Sedang memproses"><i /><i /><i /></div></div>}
      </div>
      <div className="quick-replies">
        <div className="quick-heading"><Sparkles size={13} /> Coba tanyakan</div>
        <div className="quick-list">
          {quickReplies.map((reply) => <button key={reply} className="quick-pill" onClick={() => sendMessage(reply)} disabled={processing}>{reply}</button>)}
        </div>
      </div>
      <form className="chat-form" onSubmit={submit}>
        <label className="sr-only" htmlFor="chat-input">Tulis pertanyaan</label>
        <input
          id="chat-input"
          value={input}
          maxLength={maxLength}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Tulis pertanyaan di sini..."
          autoComplete="off"
        />
        <span className="input-count">{input.length}/{maxLength}</span>
        <button className="send-button" type="submit" disabled={!input.trim() || processing} aria-label="Kirim pesan"><ArrowUp size={19} /></button>
      </form>
      <p className="chat-disclaimer">Jawaban berdasarkan informasi yang tersedia. Data yang belum dikonfirmasi ditandai untuk admin.</p>
    </section>
  );
}
