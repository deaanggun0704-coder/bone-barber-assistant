import { Bot, ShieldCheck } from 'lucide-react';
import { ChatWidget } from '../components/ChatWidget';

export function ChatPage() {
  return (
    <main className="page-main">
      <div className="container chat-page-grid">
        <div className="page-intro chat-intro">
          <div className="section-eyebrow"><Bot size={14} /> BONE BARBER ASSISTANT</div>
          <h1>Halo, ada yang<br /><em>ingin ditanyakan?</em></h1>
          <p>Asisten informasi Bone Barber Shop. Tanyakan layanan, harga, reservasi, jam buka, atau lokasi.</p>
          <div className="privacy-note"><ShieldCheck size={18} /><span><strong>Privasi tetap terjaga</strong><br />Percakapan tidak disimpan setelah halaman ditutup.</span></div>
        </div>
        <ChatWidget />
      </div>
    </main>
  );
}
