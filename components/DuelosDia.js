// components/DuelosDia.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function DuelosDia() {
  const [duelos, setDuelos] = useState([])

  useEffect(() => {
    const fetch = async () => {
      const user = (await supabase.auth.getUser()).data.user
      const hoy = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('duelos')
        .select('*')
        .eq('usuario_id', user.id)
        .gte('fecha', hoy)

      setDuelos(data || [])
    }
    fetch()
  }, [])

  return (
    <div className="overflow-auto max-h-[400px]">
      {duelos.length === 0 ? <p>No hay duelos registrados hoy.</p> : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Tipo</th>
              <th className="p-2">Entrada</th>
              <th className="p-2">Premio</th>
              <th className="p-2">Jugadores</th>
              <th className="p-2">Comisión</th>
              <th className="p-2">Hora</th>
            </tr>
          </thead>
          <tbody>
            {duelos.map((d, i) => (
              <tr key={i} className="even:bg-gray-100">
                <td className="p-2">{d.tipo}</td>
                <td className="p-2">${d.entrada}</td>
                <td className="p-2">${d.premio}</td>
                <td className="p-2">{d.jugadores}</td>
                <td className="p-2">${d.comision}</td>
                <td className="p-2">{new Date(d.fecha).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
