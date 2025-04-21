// components/DuelosDia.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion } from 'framer-motion'

export default function DuelosDia() {
  const [duelos, setDuelos] = useState([])

  useEffect(() => {
    const fetchDuelos = async () => {
      const user = (await supabase.auth.getUser()).data.user
      const hoy = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('duelos')
        .select('*')
        .eq('usuario_id', user.id)
        .gte('fecha', hoy + 'T00:00:00')
        .lte('fecha', hoy + 'T23:59:59')
        .order('fecha', { ascending: false })
      setDuelos(data || [])
    }
    fetchDuelos()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded shadow p-4"
    >
      <ul className="divide-y divide-gray-200 dark:divide-gray-600">
        {duelos.map((d, i) => (
          <li key={i} className="py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <span className="text-sm text-gray-800 dark:text-white">{d.jugadores}</span>
            <span className="text-xs text-gray-500 dark:text-gray-300">💵 ${d.entrada} | 🏆 ${d.premio} | {d.tipo}</span>
          </li>
        ))}
        {duelos.length === 0 && (
          <li className="text-gray-500 dark:text-gray-400">No hay duelos registrados hoy.</li>
        )}
      </ul>
    </motion.div>
  )
}
