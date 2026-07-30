# PR SEO — Gadai Jogja (setelah 30 Juli 2026)

Status per 30 Juli 2026: situs sudah live di Railway, domain `gadaijogja.com`,
8 URL di sitemap, 5 landing page layanan sudah terbit, NAP + jam buka sudah
terpasang di footer dan JSON-LD.

Dokumen ini berisi apa yang **belum** selesai. Urutkan dari atas.

---

## 1. Google Search Console — kerjakan minggu ini

- [ ] Tambah **Domain property** `gadaijogja.com` (verifikasi via TXT di Hostinger).
      Menggabungkan data apex + www jadi satu laporan.
- [ ] **Sitemaps** → submit `sitemap.xml`. Hapus dulu entri sitemap lama kalau ada yang error.
- [ ] **Request Indexing** untuk 6 URL (kuota ±10/hari):
      `/`, `/gadai-hp`, `/gadai-laptop`, `/gadai-motor`, `/gadai-mobil`, `/gadai-smartwatch`
- [ ] **Removals** → hapus sementara `https://gadaijogja.com/admin/login`
      (sempat terindeks lewat sitemap lama yang salah).
- [ ] URL Inspection `https://www.gadaijogja.com/` → pastikan hasilnya **"Page with redirect"**.
- [ ] [Rich Results Test](https://search.google.com/test/rich-results) untuk homepage
      dan 1 halaman layanan → pastikan Breadcrumbs, FAQ, dan LocalBusiness terdeteksi.

---

## 2. Google Business Profile — begitu approval keluar

Ini item dengan dampak **terbesar** untuk pencarian lokal. Jangan ditunda.

- [ ] Samakan NAP di GBP **persis** dengan yang di situs:
      `Jl. Kamboja, Jl. Mawar, Blotan No. 4, RT 01, Krajan, Wedomartani, Kec. Ngemplak,`
      `Sleman, Daerah Istimewa Yogyakarta 55584` — buka setiap hari 06.00–20.00.
      Sumber kebenaran ada di `src/lib/business.ts`, jangan sampai beda satu koma pun.
- [ ] Kirim link profil/Maps ke developer untuk ditambahkan ke schema:
  - [ ] `sameAs` (GBP, Instagram, Facebook, TikTok bila ada)
  - [ ] `geo` (latitude/longitude persis dari pin Maps)
  - [ ] `hasMap` (link Google Maps)
  - [ ] Tombol "Lihat di Google Maps" + embed peta di footer / halaman kontak
- [ ] Upload minimal 10 foto asli: tampak depan toko, area parkir unit, ruang
      penyimpanan, proses taksir, tim. Foto asli jauh lebih berpengaruh daripada stok.
- [ ] Isi kategori utama: *Pawn shop* / *Gadai*. Tambah kategori sekunder yang relevan.
- [ ] Aktifkan tombol WhatsApp/telepon dan isi deskripsi bisnis (pakai wording
      "pengajuan online, serah terima unit di lokasi" — **bukan** "gadai online").

---

## 3. Review pelanggan — mulai secepatnya

Saat ini schema `aggregateRating` di homepage dibangun dari testimoni internal.
Google umumnya **tidak** menampilkan bintang untuk review yang ditulis sendiri
oleh pemilik situs (kebijakan *self-serving reviews*).

- [ ] Kumpulkan review asli di **Google Business Profile** (bukan di situs).
      Target awal: 20 review dalam 3 bulan.
- [ ] Buat link pendek "tulis review" dari GBP, kirim ke pelanggan setelah unit ditebus.
- [ ] Balas semua review, termasuk yang negatif. Ini sinyal aktivitas untuk Google.
- [ ] Setelah ada review asli di GBP, pertimbangkan mengganti testimoni statis di
      homepage dengan kutipan review Google (sebutkan sumbernya).

---

## 4. Konten & halaman yang masih kosong

Halaman yang belum ada dan biasanya dicari calon pelanggan:

- [ ] `/tentang-kami` — profil usaha, legalitas, sudah berapa lama beroperasi, foto tempat.
      Penting untuk sinyal E-E-A-T di kategori keuangan (YMYL).
- [ ] `/kontak` atau `/lokasi` — alamat lengkap, embed Maps, jam buka, patokan arah
      ("dari Ring Road Utara ke arah ...", "dekat ..."). Bagus untuk query "gadai dekat sini".
- [ ] `/syarat-ketentuan` — aturan gadai, denda telat, prosedur lelang/pelepasan unit.
      Wajib untuk kepercayaan, dan Google menilai transparansi di situs keuangan.
- [ ] `/simulasi` — kalkulator jasa 10% per 2 minggu. Konten interaktif menahan
      pengunjung lebih lama dan menjaring query "hitungan gadai".

Halaman lokasi (kerjakan **setelah** GBP aktif, jangan sekaligus 5 halaman):

- [ ] `/gadai-sleman`, `/gadai-bantul`, `/gadai-kota-yogyakarta`
      Masing-masing harus punya isi berbeda nyata (patokan jalan, kampus/pasar terdekat,
      estimasi jarak ke toko). **Jangan** copy-paste dengan ganti nama kota — itu
      *doorway page* dan bisa kena penalti.

Artikel (opsional, jangka panjang):

- [ ] `/blog` 1–2 artikel per bulan menargetkan pertanyaan nyata:
      "beda gadai unit masuk vs gadai BPKB", "cara menaksir harga HP bekas",
      "apa yang terjadi kalau telat menebus".

---

## 5. Teknis yang masih bisa dirapikan

- [ ] **Kompresi gambar.** `public/images/7.jpeg` 207 KB dan `2.jpeg` 143 KB masih besar.
      Konversi ke WebP/AVIF, target < 80 KB per file. Berpengaruh ke LCP.
- [ ] **Cek Core Web Vitals** di [PageSpeed Insights](https://pagespeed.web.dev/)
      untuk homepage dan `/gadai-motor` (mobile). Target: LCP < 2.5s, CLS < 0.1, INP < 200ms.
- [ ] **`og-image.jpg`** (58 KB) — pastikan ukurannya 1200×630 dan teksnya masih
      relevan setelah wording "gadai online" dihapus.
- [ ] **`priceRange: '$$'`** di schema homepage masih placeholder. Ganti jadi rentang
      pinjaman nyata, mis. `'Rp500.000 - Rp50.000.000'`.
- [ ] **Lint warning lama** di `src/app/page.tsx`: array index dipakai sebagai `key`,
      dan "ambiguous spacing" di H1. Tidak merusak, tapi rapikan saat ada waktu.
- [ ] **Alt text gambar** di halaman layanan masih generik ("Layanan gadai motor di
      Gadai Jogja"). Ganti dengan deskripsi isi foto yang sebenarnya.
- [ ] Pertimbangkan menyambungkan Railway ke repo GitHub supaya deploy otomatis
      setiap `git push` (saat ini harus manual `railway up --service gadai`).

---

## 6. Analitik & pemantauan

- [ ] Pasang **Google Analytics 4** atau alternatif ringan (Umami/Plausible).
      Saat ini belum ada tracking sama sekali — tidak ada data konversi.
- [ ] Tandai konversi: klik tombol WhatsApp, submit form `/create`.
- [ ] Hubungkan GA4 ↔ Search Console.

Ritme pengecekan:

| Kapan | Yang dicek |
|---|---|
| Mingguan (4 minggu pertama) | GSC → Pages: apakah 5 URL baru sudah "Indexed" |
| Bulanan | GSC → Performance: query & posisi rata-rata per halaman layanan |
| Bulanan | GBP Insights: berapa panggilan, klik arah, klik situs |
| Kuartalan | PageSpeed, audit broken link, refresh konten lama |

---

## 7. Yang perlu dikonfirmasi pemilik

Isi berikut ditulis berdasarkan asumsi, **belum divalidasi**. Cek dan koreksi:

- [ ] Daftar merek di tiap halaman layanan (`src/lib/services.ts`) — sudah sesuai
      yang benar-benar diterima?
- [ ] Syarat "wajib logout iCloud / Find My", "charger disertakan", "Activation Lock
      dilepas" — benar diberlakukan?
- [ ] Klaim "bisa tanpa BPKB" untuk motor — sudah dipastikan?
- [ ] "Taksiran hingga 85% harga pasaran" — angka ini dipakai di banyak tempat,
      pastikan tidak overclaim.
- [ ] Rentang plafon pinjaman minimum dan maksimum (untuk `priceRange` di schema).

---

## Ekspektasi waktu

- URL baru terindeks: **3–14 hari**
- Mulai muncul di halaman 2–3 untuk query long-tail: **4–8 minggu**
- Bersaing di halaman 1 untuk "gadai hp jogja" dsb: **3–6 bulan**, dan itu pun
  sangat bergantung pada Google Business Profile + jumlah review asli.

Jangan submit ulang URL berkali-kali — tidak mempercepat apa pun dan tidak ada
efeknya selain membuang kuota.
