'use client'

import { useState } from 'react'

// Client island: tab switching + the amount input's live "1.000.000" formatting.
// Kept separate from the FAQ accordion so the two no longer share the same
// `openFaq` state (previously a latent bug: opening an FAQ item elsewhere on the
// page could silently flip which tab appeared active here).
export default function AjukanFormTabs() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0)
  const [amountDisplay, setAmountDisplay] = useState('')

  const formatAmount = (value: string) => {
    const number = value.replace(/\D/g, '')
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value)
    setAmountDisplay(formatted)
  }

  return (
    <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-lg border border-gray-100">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab(0)}
          className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
            activeTab === 0 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Ajukan
        </button>
        <button
          onClick={() => setActiveTab(1)}
          className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
            activeTab === 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Cara Kerja
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 0 ? (
          /* Form Tab */
          <div>
            <form action="/create" method="GET" className="space-y-4">
              <div>
                <input type="text" name="name" placeholder="Nama Lengkap" required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              </div>

              <div>
                <input type="tel" name="phone" placeholder="Nomor WhatsApp" required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select name="category" required
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-600">
                  <option value="">Kategori</option>
                  <option value="HP">HP</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Motor">Motor</option>
                  <option value="Mobil">Mobil</option>
                </select>

                <div className="relative">
                  <input type="hidden" name="amount" value={amountDisplay.replace(/\./g, '')} />
                  <input type="text" placeholder="1.000.000" onChange={handleAmountChange} value={amountDisplay}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-right" />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-200 mt-4">
                Lanjutkan Pengajuan
              </button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-4">
              atau hubungi via{' '}
              <a href="https://wa.me/6282299748978" target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline">
                WhatsApp 0822-9974-8978
              </a>
            </p>
          </div>
        ) : (
          /* Cara Kerja Tab */
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Hubungi via WhatsApp</h4>
                <p className="text-gray-600 text-sm">Hubungi via WhatsApp atau isi form di website untuk taksir harga</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Setuju Harga</h4>
                <p className="text-gray-600 text-sm">Jika setuju dengan taksiran, datang ke lokasi dengan barang</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Verifikasi & Cair</h4>
                <p className="text-gray-600 text-sm">Cek barang, dana langsung cair</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Tebus / Perpanjang</h4>
                <p className="text-gray-600 text-sm">Bayar jasa + pokok untuk menebus barang</p>
              </div>
            </div>

            <a href="https://wa.me/6282299748978?text=Halo%20Gadai%20Jogja,%20saya%20ingin%20bertanya"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-bold text-center transition shadow-lg mt-4">
              Tanya via WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
