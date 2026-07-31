'use client'

import { useEffect } from 'react'

interface PhotoLightboxProps {
  src: string
  onClose: () => void
}

export default function PhotoLightbox({ src, onClose }: Readonly<PhotoLightboxProps>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup preview"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 animate-overlay-in cursor-default"
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup preview"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition z-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Preview"
        className="relative max-w-full max-h-full rounded-lg shadow-2xl animate-modal-in"
      />
    </div>
  )
}
