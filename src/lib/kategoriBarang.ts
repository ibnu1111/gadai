// Kategori barang yang sah untuk pengajuan gadai. Dipakai bersama oleh
// endpoint create (/api/gadai) dan endpoint edit (/api/gadai/[id]) supaya
// keduanya tidak bisa berbeda daftar.
export const VALID_KATEGORI = ['Mobil', 'Motor', 'Elektronik', 'HP', 'Laptop', 'Perhiasan', 'Lainnya']
