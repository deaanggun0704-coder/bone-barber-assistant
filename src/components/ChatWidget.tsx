import { ArrowUp, Bot, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { businessConfig } from '../data/businessConfig';
import { getFaqAnswer } from '../data/faq';
import { shop } from '../data/shop';
import { createProductInquiryWhatsAppUrl } from '../utils/whatsapp';

type ChatOption = { kind: 'service' | 'product'; value: string; label: string };
type Message = {
  id: number;
  sender: 'bot' | 'user';
  text: string;
  options?: ChatOption[];
  action?: { label: string; href: string; external?: boolean };
};
const welcome = 'Halo! Saya Bone Barber Assistant. Saya siap membantu informasi layanan, harga, reservasi, dan lokasi Bone Barber Shop.';
const quickReplies = ['Pilih potong rambut', 'Pilih produk', 'Daftar layanan', 'Jam buka', 'Lokasi kami', 'Cara reservasi'];
const maxLength = 500;

function getBotReply(text: string): Omit<Message, 'id' | 'sender'> {
  if (text.trim().toLocaleLowerCase('id-ID') === 'pilih potong rambut') {
    return {
      text: 'Pilih layanan potong rambut atau perawatan yang Anda inginkan:',
      options: shop.services.map((service) => ({
        kind: 'service',
        value: service.name,
        label: `${service.name} · ${service.price}`,
      })),
    };
  }
  if (text.trim().toLocaleLowerCase('id-ID') === 'pilih produk') {
    return {
      text: 'Berikut produk dan harga jual pada katalog. Stok yang tercantum adalah catatan, bukan data real-time:',
      options: shop.products.map((product) => ({
        kind: 'product',
        value: product.name,
        label: `${product.name} · ${product.category} · ${product.price} · Stok tercatat ${product.stock} ${product.unit}`,
      })),
    };
  }
  return { text: getFaqAnswer(text) };
}

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([{ id: 1, sender: 'bot', text: welcome }]);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);
  const responseTimeout = useRef<number | null>(null);
  const reservationConfirmationShown = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, processing]);

  useEffect(() => {
    if (searchParams.get('reservation') !== 'prepared' || reservationConfirmationShown.current) return;
    reservationConfirmationShown.current = true;
    setMessages((current) => [...current, {
      id: nextId.current++,
      sender: 'bot',
      text: 'Formulir reservasi sudah valid dan draf WhatsApp telah dibuka. Silakan periksa lalu tekan Kirim di WhatsApp agar permintaan diteruskan ke admin. Ini belum berarti jadwal disetujui; admin akan mengonfirmasi ketersediaannya.',
    }]);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete('reservation');
      return next;
    }, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => () => {
    if (responseTimeout.current !== null) window.clearTimeout(responseTimeout.current);
  }, []);

  function queueBotReply(reply: () => Omit<Message, 'id' | 'sender'>) {
    setProcessing(true);
    responseTimeout.current = window.setTimeout(() => {
      setMessages((current) => [...current, { id: nextId.current++, sender: 'bot', ...reply() }]);
      setProcessing(false);
      responseTimeout.current = null;
    }, 350);
  }

  function sendMessage(raw: string) {
    const text = raw.trim();
    if (!text || text.length > maxLength || processing) return;
    setInput('');
    setMessages((current) => [...current, { id: nextId.current++, sender: 'user', text }]);
    queueBotReply(() => {
      const reply = getBotReply(text);
      if (reply.text.includes('halaman Reservasi')) {
        return { ...reply, action: { label: 'Isi formulir reservasi', href: '/reservasi' } };
      }
      return reply;
    });
  }

  function selectOption(option: ChatOption) {
    if (processing) return;
    setMessages((current) => [...current, { id: nextId.current++, sender: 'user', text: option.value }]);
    queueBotReply(() => {
      if (option.kind === 'service') {
        const service = shop.services.find((item) => item.name === option.value);
        return {
          text: `Pilihan Anda: ${option.value}. Durasi ${service?.duration ?? 'perlu dikonfirmasi'} dengan harga acuan ${service?.price ?? 'perlu dikonfirmasi'}. Harga perlu dikonfirmasi admin. Anda dapat lanjut mengisi data reservasi; setelah formulir valid, WhatsApp akan terbuka dengan pesan yang sudah disiapkan.`,
          action: { label: 'Isi data reservasi', href: `/reservasi?service=${encodeURIComponent(option.value)}` },
        };
      }

      const product = shop.products.find((item) => item.name === option.value);
      const url = createProductInquiryWhatsAppUrl(businessConfig.adminWhatsApp, option.value);
      return {
        text: product
          ? `Pilihan Anda: ${product.name} (${product.category}). Harga jual ${product.price}; stok tercatat ${product.stock} ${product.unit}, bukan data real-time. Stok bisa berubah mengikuti penjualan.`
          : `Produk ${option.value} tidak ditemukan di katalog.`,
        ...(url ? { action: { label: 'Tanyakan produk via WhatsApp', href: url, external: true } } : {}),
      };
    });
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
              {message.options && (
                <div className="chat-option-list">
                  {message.options.map((option) => (
                    <button className="chat-option" key={`${option.kind}-${option.value}`} onClick={() => selectOption(option)} disabled={processing}>
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
              {message.action && (
                message.action.external
                  ? <a className="chat-action-link" href={message.action.href} target="_blank" rel="noreferrer">{message.action.label}</a>
                  : <Link className="chat-action-link" to={message.action.href}>{message.action.label}</Link>
              )}
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
