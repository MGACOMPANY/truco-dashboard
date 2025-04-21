// components/Saldos.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion } from 'framer-motion'

export default function Saldos({ usuario }) {
  const [saldos, setSaldos] = useState([])
  const [monto, setMonto] = useState('')
  const [seleccionado, setSeleccionado] = useState(null)

  const obtenerSaldos = async () => {
    const { data } = await supabase
      .from('saldos')
      .select('*')
      .eq('usuario_id', usuario.id)
    setSaldos(data || [])
  }

  useEffect(() => {
    if (usuario) obtenerSaldos()
  }, [usuario])

  const actualizarSaldo = async (id, tipo) => {
    const valor = parseInt(monto)
    if (isNaN(valor) || !valor) return

    const item = saldos.find(s => s.id === id)
    const nuevoSaldo = tipo === '+' ? item.saldo + valor : item.saldo - valor

    await supabase.from('saldos').update({ saldo: nuevoSaldo }).eq('id', id)
    setMonto('')
    obtenerSaldos()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-4 rounded shadow"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">💰 Saldos</h2>
      <ul className="space-y-2">
        {saldos.map((s) => (
          <li key={s.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <span className="text-sm text-gray-800 dark:text-white">{s.nombre}</span>
            <span className="text-sm text-green-600 font-semibold">${s.saldo}</span>
            <div className="flex gap-1">
              <input
                type="number"
                placeholder="Monto"
                value={seleccionado === s.id ? monto : ''}
                onChange={(e) => {
                  setSeleccionado(s.id)
                  setMonto(e.target.value)
                }}
                className="border px-2 py-1 w-20 rounded dark:bg-gray-600 dark:text-white"
              />
              <button
                onClick={() => actualizarSaldo(s.id, '+')}
                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                +
              </button>
              <button
                onClick={() => actualizarSaldo(s.id, '-')}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                -
              </button>
            </div>
          </li>
        ))}
        {saldos.length === 0 && (
          <li className="text-gray-500 dark:text-gray-300">No hay jugadores registrados.</li>
        )}
      </ul>
    </motion.div>
  )
}
