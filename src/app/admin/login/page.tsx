'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [registerData, setRegisterData] = useState({ nama: '', email: '', password: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem('adminToken', data.data.token)
        localStorage.setItem('adminData', JSON.stringify(data.data.admin))
        router.push('/admin/gadai')
      } else {
        alert(data.message || 'Login gagal')
      }
    } catch {
      alert('Login gagal')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem('adminToken', data.data.token)
        localStorage.setItem('adminData', JSON.stringify(data.data.admin))
        router.push('/admin/gadai')
      } else {
        alert(data.message || 'Registrasi gagal')
      }
    } catch {
      alert('Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Gadai Jogja</h1>
          <p className="text-stone-500 mt-1">Admin Panel</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          {!showRegister ? (
            <>
              <h2 className="text-xl font-semibold text-stone-800 mb-6">Masuk</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                    placeholder="admin@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                    placeholder="Masukkan password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-800 text-white py-3 rounded-lg hover:bg-stone-900 disabled:opacity-50 font-medium transition mt-2"
                >
                  {loading ? 'Loading...' : 'Masuk'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-stone-100 text-center">
                <p className="text-stone-500 text-sm">
                  Belum punya akun?{' '}
                  <button onClick={() => setShowRegister(true)} className="text-amber-600 hover:text-amber-700 font-medium">
                    Daftar
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-stone-800 mb-2">Daftar Admin Baru</h2>
              <p className="text-stone-500 text-sm mb-6">Buat akun admin pertama Anda</p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Nama</label>
                  <input
                    type="text"
                    value={registerData.nama}
                    onChange={(e) => setRegisterData({ ...registerData, nama: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                    placeholder="Nama lengkap"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                    placeholder="admin@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium transition mt-2"
                >
                  {loading ? 'Loading...' : 'Daftar'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-stone-100 text-center">
                <button onClick={() => setShowRegister(false)} className="text-stone-500 hover:text-stone-700 text-sm">
                  &larr; Kembali ke login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
