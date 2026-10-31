import { shop } from './shop';

export type FaqEntry = {
  intent: string;
  keywords: string[];
  answer: string;
};

const unknown = 'Maaf, informasi tersebut belum tersedia. Silakan hubungi admin Bone Barber Shop untuk mendapatkan informasi lebih lanjut.';
const missing = 'Perlu diisi admin. ' + unknown;
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
    answer: `Jam operasional: ${shop.openingHours}.`,
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
    keywords: ['reservasi', 'booking', 'pesan jadwal', 'buat janji', 'appointment', 'antrian'],
    answer: `Informasi dan prosedur reservasi: ${missing}`,
  },
  {
    intent: 'contact',
    keywords: ['kontak', 'hubungi bone', 'whatsapp', 'telepon', 'nomor admin'],
    answer: `Kontak Bone Barber Shop: ${shop.whatsapp}.`,
  },
  {
    intent: 'products',
    keywords: ['produk', 'pomade', 'wax', 'sampo', 'shampoo'],
    answer: `Kategori produk yang tercatat di sistem: ${shop.productCategories.map((category) => category.name).join(', ')}. Nama/merek produk, harga jual, dan stok perlu dikonfirmasi admin; daftar kategori tidak memastikan stok tersedia saat ini.`,
  },
  {
    intent: 'payment',
    keywords: ['pembayaran', 'bayar', 'cash', 'tunai', 'qris', 'debit', 'metode pembayaran'],
    answer: `Metode pembayaran: ${shop.paymentMethods.join(', ')}.`,
  },
  {
    intent: 'distance',
    keywords: ['jarak', 'hitung jarak', 'seberapa jauh'],
    answer: 'Anda dapat menghitung jarak garis lurus di halaman Lokasi. Perhitungan tersedia setelah koordinat toko diverifikasi admin.',
  },
];

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase('id-ID')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function getFaqAnswer(question: string): string {
  const normalized = normalizeText(question);
  if (!normalized) return unknown;

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
