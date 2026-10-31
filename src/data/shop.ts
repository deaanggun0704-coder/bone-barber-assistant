export type Coordinate = { lat: number; lon: number };
export type Service = { name: string; description: string; price: string };

export const shop = {
  name: 'Bone Barber Shop',
  address: 'Jalan Bima No. 12, Kejaksan, Kota Cirebon, Jawa Barat',
  // Isi hanya setelah koordinat toko dikonfirmasi dan diverifikasi admin.
  coordinates: null as Coordinate | null,
  openingHours: 'Perlu diisi admin',
  phone: 'Perlu diisi admin',
  whatsapp: 'Perlu diisi admin',
  products: ['Perlu diisi admin'],
  paymentMethods: ['Perlu diisi admin'],
  services: [
    {
      name: 'Potong Rambut',
      description: 'Informasi layanan dan harga perlu dikonfirmasi admin.',
      price: 'Perlu diisi admin',
    },
    {
      name: 'Layanan lain (perlu diisi admin)',
      description: 'Daftar layanan lain akan diperbarui setelah dikonfirmasi.',
      price: 'Perlu diisi admin',
    },
  ] satisfies Service[],
};
