// components/NotificacionFlotante.js
import { useEffect } from 'react'

export default function NotificacionFlotante({ mensaje, visible, onClose }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [visible])

  return (
    <div
      className={`fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg transition-all duration-300 ease-in-out transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      style={{ zIndex: 9999 }}
    >
      {mensaje}
    </div>
  )
}
