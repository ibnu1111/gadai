import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-stone-800">Gadai Jaya</span>
            </div>
            <nav className="flex items-center gap-6">
              <a href="#layanan" className="text-stone-600 hover:text-stone-900 transition">Layanan</a>
              <a href="#cara-kerja" className="text-stone-600 hover:text-stone-900 transition">Cara Kerja</a>
              <a href="/track" className="text-stone-600 hover:text-stone-900 transition">Lacak</a>
              <Link href="/admin/login" className="text-stone-500 hover:text-stone-700 text-sm">Masuk</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-amber-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-stone-800 leading-tight mb-6">
                Gadai Barang<br />
                <span className="text-amber-600">Terpercaya & Mudah</span>
              </h1>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                Butuh dana cepat dengan jaminan barang? Kami hadir dengan proses yang transparan,
                bunga rendah, dan pelayanan yang ramah. barang Anda aman tersimpan dengan baik.
              </p>
              <div className="flex gap-4">
                <a href="#pengajuan" className="bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition shadow-lg shadow-amber-200">
                  Ajukan Sekarang
                </a>
                <a href="#cara-kerja" className="border border-stone-300 text-stone-700 px-6 py-3 rounded-lg font-medium hover:bg-white hover:border-stone-400 transition">
                  Pelajari Lebih
                </a>
              </div>

              <div className="flex gap-8 mt-10 pt-8 border-t border-stone-200">
                <div>
                  <p className="text-3xl font-bold text-stone-800">10K+</p>
                  <p className="text-sm text-stone-500">Nasabah Puas</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-stone-800">15+</p>
                  <p className="text-sm text-stone-500">Tahun Pengalaman</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-stone-800">98%</p>
                  <p className="text-sm text-stone-500">Tingkat Kepuasan</p>
                </div>
              </div>
            </div>

            <div id="pengajuan" className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 p-6 md:p-8 border border-stone-100">
              <h2 className="text-xl font-semibold text-stone-800 mb-2">Ajukan Gadai</h2>
              <p className="text-sm text-stone-500 mb-6">Isi formulir di bawah untuk memulai</p>

              <form action="/create" method="GET" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Nama Lengkap</label>
                  <input type="text" name="name" placeholder="Masukkan nama Anda" required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Nomor HP / WhatsApp</label>
                  <input type="tel" name="phone" placeholder="08xxxxxxxxxx" required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Kategori Barang</label>
                  <select name="category" required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-stone-600">
                    <option value="">Pilih kategori</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Perhiasan">Perhiasan</option>
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Gadget">Gadget</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Estimasi Nilai (Rp)</label>
                  <input type="number" name="amount" placeholder="Contoh: 500000" min="100000" required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition" />
                </div>

                <button type="submit" className="w-full bg-amber-600 text-white py-3.5 rounded-lg font-semibold hover:bg-amber-700 transition mt-2">
                  Lanjutkan Pengajuan
                </button>
              </form>

              <p className="text-xs text-stone-400 text-center mt-4">
                Dengan melanjutkan, Anda menyetujui syarat & ketentuan yang berlaku
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="layanan" className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-800 mb-4">Layanan Kami</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">
              Berbagai pilihan gadai yang bisa Anda pilih sesuai kebutuhan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mb-2">Gadai Elektronik</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                HP, laptop, kamera, dan elektronik lainnya dengan penilaian transparan dan harga kompetitif.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mb-2">Gadai Perhiasan</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Emas, cincin, kalung, dan perhiasan lainnya. Nilai gadai tinggi dengan bunga rendah.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mb-2">Gadai Kendaraan</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Motor dan kendaraan lainnya. Proses cepat, barang tetap bisa digunakan setelah pelunasan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="cara-kerja" className="bg-stone-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-800 mb-4">Cara Kerja</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">
              Proses gadai yang sederhana dan transparan
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold text-stone-800 mb-2">Isi Formulir</h3>
              <p className="text-sm text-stone-500">Lengkapi data diri dan info barang yang akan digadaikan</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold text-stone-800 mb-2">Penilaian</h3>
              <p className="text-sm text-stone-500">Tim kami akan menilai barang dan memberikan penawaran terbaik</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold text-stone-800 mb-2">Setuju & Cair</h3>
              <p className="text-sm text-stone-500">Setujui penawaran,签字 kontrak, dan dana langsung cair</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
              <h3 className="font-semibold text-stone-800 mb-2">Lunas & Ambil</h3>
              <p className="text-sm text-stone-500">Bayar tepat waktu, ambil kembali barang Anda</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 mt-12 border border-stone-100">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-4xl font-bold text-amber-600 mb-2">10%</p>
                <p className="text-stone-600">Bunga 2 Minggu</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-amber-600 mb-2">20%</p>
                <p className="text-stone-600">Bunga 1 Bulan</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-amber-600 mb-2">24 Jam</p>
                <p className="text-stone-600">Proses Cair</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-stone-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Butuh Informasi Lebih?</h2>
          <p className="text-stone-300 mb-8">
            Hubungi kami melalui WhatsApp untuk konsultasi gratis
          </p>
          <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="text-stone-400 font-medium">Gadai Jaya</span>
            </div>
            <p className="text-stone-500 text-sm">
              &copy; 2024 Gadai Jaya. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
