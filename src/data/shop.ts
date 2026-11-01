export type Coordinate = { lat: number; lon: number };
export type Service = { name: string; description: string; price: string; duration: string };
export type Product = { name: string; price: string; stock: number; unit: string };

export const shop = {
  name: 'Bone Barber Shop',
  address: 'Jalan Bima No. 12, Kejaksan, Kota Cirebon, Jawa Barat',
  mapsUrl: 'https://maps.app.goo.gl/qwCqZDL1PW3LpYA98?g_st=ic',
  // Isi hanya setelah koordinat toko dikonfirmasi dan diverifikasi admin.
  coordinates: null as Coordinate | null,
  products: [
    { name: 'Serum Rambut', price: 'Rp40.000', stock: 50, unit: 'pcs' },
    { name: 'Hair Tonik', price: 'Rp25.000', stock: 50, unit: 'pcs' },
    { name: 'Dust / Hair Powder', price: 'Rp35.000', stock: 50, unit: 'pcs' },
    { name: 'Pomade 120gr', price: 'Rp50.000', stock: 25, unit: 'pcs' },
    { name: 'Pomade 100gr', price: 'Rp40.000', stock: 25, unit: 'pcs' },
  ] satisfies Product[],
  paymentMethods: ['Perlu diisi admin'],
  services: [
    {
      name: 'Haircut Reguler',
      description: 'Potong rambut standar.',
      price: 'Rp35.000',
      duration: '30 menit',
    },
    {
      name: 'Haircut + Cuci',
      description: 'Potong rambut dan cuci rambut.',
      price: 'Rp50.000',
      duration: '45 menit',
    },
    {
      name: 'Cukur Jenggot',
      description: 'Cukur dan rapikan jenggot dengan pisau cukur.',
      price: 'Rp25.000',
      duration: '20 menit',
    },
    {
      name: 'Creambath',
      description: 'Perawatan rambut dengan creambath.',
      price: 'Rp75.000',
      duration: '60 menit',
    },
    {
      name: 'Color / Pewarnaan',
      description: 'Pewarnaan rambut sesuai pilihan.',
      price: 'Rp150.000',
      duration: '90 menit',
    },
    {
      name: 'Haircut Premium',
      description: 'Potong rambut, cuci, dan styling premium.',
      price: 'Rp100.000',
      duration: '60 menit',
    },
    {
      name: 'Kids Haircut',
      description: 'Potong rambut anak di bawah 12 tahun.',
      price: 'Rp30.000',
      duration: '30 menit',
    },
    {
      name: 'Paket Lengkap',
      description: 'Haircut, cukur jenggot, cuci, dan styling.',
      price: 'Rp150.000',
      duration: '90 menit',
    },
  ] satisfies Service[],
};
