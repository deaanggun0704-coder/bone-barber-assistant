import { shop } from './shop';
import { businessConfig } from './businessConfig';

export type FaqEntry = {
  intent: string;
  keywords: string[];
  answer: string;
};

const unknown = 'Maaf, informasi tersebut belum tersedia. Silakan hubungi admin Bone Barber Shop untuk mendapatkan informasi lebih lanjut.';
const shopTopics = [
  'bone barber', 'barbershop', 'barber', 'potong rambut', 'rambut', 'cukur',
  'layanan', 'servis', 'harga', 'tarif', 'reservasi', 'booking', 'jadwal',
  'promo', 'diskon', 'produk', 'pembayaran', 'bayar', 'alamat', 'lokasi',
  'jam operasional', 'jam buka', 'kontak', 'admin', 'pomade',
];

export const outsideTopicAnswer =
  'Maaf, saya hanya dapat membantu memberikan informasi seputar Bone Barber Shop. Silakan tanyakan mengenai layanan, harga, reservasi, atau lokasi kami.';

export const faq: FaqEntry[] = [
  {
    intent: 'profile',
    keywords: ['tentang bone', 'profil bone barber', 'barbershop', 'bone barber shop', 'bone barber'],
    answer: 'Bone Barber Shop adalah barbershop di Cirebon. Informasi profil lebih lengkap: Perlu diisi admin.',
  },
  {
    intent: 'location',
    keywords: ['lokasi', 'alamat', 'di mana', 'dimana', 'cirebon', 'jalan bima', 'maps', 'peta'],
    answer: `Alamat Bone Barber Shop: ${shop.address}.`,
  },
  {
    intent: 'hours',
    keywords: ['jam buka', 'jam operasional', 'buka pukul', 'tutup pukul', 'operasional'],
    answer: `Jam operasional: ${businessConfig.openingHoursLabel}.`,
  },
  {
    intent: 'services',
    keywords: ['layanan', 'servis', 'potong rambut', 'haircut', 'cukur', 'daftar layanan'],
    answer: `Layanan pada data sistem: ${shop.services.map((service) => `${service.name} (${service.duration})`).join('; ')}. Data ini berasal dari daftar bawaan situs operasional dan perlu dikonfirmasi admin.`,
  },
  {
    intent: 'prices',
    keywords: ['harga potong rambut', 'harga', 'tarif', 'biaya', 'price'],
    answer: `Harga acuan dari data bawaan situs operasional (belum dikonfirmasi admin): ${shop.services.map((service) => `${service.name}: ${service.price}`).join('; ')}. Mohon konfirmasi harga terbaru kepada admin sebelum berkunjung.`,
  },
  {
    intent: 'booking',
    keywords: [
      'reservasi', 'booking', 'pesan jadwal', 'buat janji', 'appointment', 'antrian',
      'mau booking', 'mau reservasi', 'bisa pesan tempat', 'cara booking',
      'ingin potong rambut besok',
    ],
    answer: 'Buka halaman Reservasi untuk mengisi nama, nomor WhatsApp, layanan, tanggal, dan jam kedatangan. Setelah formulir valid, WhatsApp terbuka dengan draf permintaan; tekan Kirim agar diteruskan ke admin. Waktu yang diminta belum menjamin slot tersedia; admin akan mengonfirmasi melalui WhatsApp.',
  },
  {
    intent: 'contact',
    keywords: ['kontak', 'hubungi bone', 'whatsapp', 'telepon', 'nomor admin'],
    answer: `Kontak WhatsApp Bone Barber Shop: ${businessConfig.adminWhatsApp || 'Perlu diisi admin'}.`,
  },
  {
    intent: 'products',
    keywords: ['produk', 'pomade', 'gatsby', 'hair tonic', 'hair powder', 'serum rambut', 'makarizo'],
    answer: getProductAnswer('produk') ?? unknown,
  },
  {
    intent: 'payment',
    keywords: ['pembayaran', 'bayar', 'cash', 'tunai', 'qris', 'debit', 'metode pembayaran'],
    answer: `Metode pembayaran: ${shop.paymentMethods.join(', ')}.`,
  },
  {
    intent: 'distance',
    keywords: ['jarak', 'hitung jarak', 'seberapa jauh'],
    answer: 'Buka halaman Lokasi dan izinkan akses lokasi atau masukkan koordinat Anda. Dari sana Anda dapat membuka rute kendaraan bermotor, jalan kaki, atau sepeda di Google Maps untuk melihat jarak perjalanan dan estimasi waktunya. Jarak garis lurus hanya tersedia setelah koordinat toko diverifikasi.',
  },
];

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase('id-ID')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function getProductAnswer(question: string): string | null {
  const normalized = normalizeText(question);
  const matchingProducts = shop.products.filter((product) => {
    const name = normalizeText(product.name);
    const distinctiveWords = name.split(' ').filter((word) => !['hair', 'rambut'].includes(word));
    return normalized.includes(name)
      || distinctiveWords.some((word) => ` ${normalized} `.includes(` ${word} `))
      || ` ${normalized} `.includes(` ${normalizeText(product.category)} `);
  });
  const asksAboutProducts = /\b(?:produk|jual|dijual)\b/.test(normalized) || matchingProducts.length > 0;
  if (!asksAboutProducts) return null;

  const products = matchingProducts.length > 0 ? matchingProducts : shop.products;
  return `Produk dalam katalog Bone Barber Shop: ${products.map((product) => `${product.name} (${product.category}, ${product.price}, stok tercatat ${product.stock} ${product.unit})`).join('; ')}. Catatan stok bukan data real-time dan dapat berubah; silakan konfirmasi ketersediaan terbaru kepada admin.`;
}

export function getFaqAnswer(question: string): string {
  const normalized = normalizeText(question);
  if (!normalized) return unknown;
  const booking = faq.find((entry) => entry.intent === 'booking');
  if (booking && (
    /\b(?:mau|ingin|pengen|bisa|boleh)\b.*\b(?:booking|reservasi|pesan(?: tempat)?|potong rambut)\b/.test(normalized)
    || /\b(?:cara|bagaimana|gimana)\b.*\b(?:booking|reservasi)\b/.test(normalized)
  )) {
    return booking.answer;
  }

  const productAnswer = getProductAnswer(question);
  if (productAnswer) return productAnswer;

  const ranked = faq
    .map((entry) => ({
      entry,
      score: entry.keywords.reduce((total, keyword) => {
        const key = normalizeText(keyword);
        return total + (` ${normalized} `.includes(` ${key} `) ? (key.includes(' ') ? 2 : 1) : 0);
      }, 0),
    }))
    .sort((a, b) => b.score - a.score);

  if (!ranked[0] || ranked[0].score === 0) {
    return shopTopics.some((topic) => ` ${normalized} `.includes(` ${normalizeText(topic)} `))
      ? unknown
      : outsideTopicAnswer;
  }
  return ranked[0].entry.answer;
}

export const unavailableAnswer = unknown;
