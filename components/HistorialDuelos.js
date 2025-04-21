// components/HistorialDuelos.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion } from 'framer-motion'

export default function HistorialDuelos() {
  const [duelos, setDuelos] = useState([])

  useEffect(() => {
    const fetch = async () => {
      const user = (await supabase.auth.getUser()).data.user
      const { data } = await supabase
        .from('historial_duelos')
        .select('*')
        .eq('usuario_id', user.id)
        .order('fecha', { ascending: false })
      setDuelos(data || [])
    }
    fetch()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-4 rounded shadow"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">📜 Historial completo</h2>
      <div className="overflow-auto max-h-[500px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white">
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Tipo</th>
              <th className="p-2 text-left">Entrada</th>
              <th className="p-2 text-left">Premio</th>
              <th className="p-2 text-left">Comisión</th>
              <th className="p-2 text-left">Jugadores</th>
            </tr>
          </thead>
          <tbody>
            {duelos.map((d, i) => (
              <tr key={i} className="even:bg-gray-50 dark:even:bg-gray-700 text-gray-800 dark:text-white">
                <td className="p-2">{d.fecha.split('T')[0]}</td>
                <td className="p-2">{d.tipo}</td>
                <td className="p-2">${d.entrada}</td>
                <td className="p-2">${d.premio}</td>
                <td className="p-2">${d.comision}</td>
                <td className="p-2">{d.jugadores}</td>
              </tr>
            ))}
            {duelos.length === 0 && (
              <tr>
                <td className="p-2 text-gray-500 dark:text-gray-300" colSpan="6">No hay duelos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
