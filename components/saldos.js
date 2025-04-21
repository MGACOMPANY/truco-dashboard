// components/Saldos.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Saldos() {
  const [saldos, setSaldos] = useState([])
  const [nuevo, setNuevo] = useState('')
  const [monto, setMonto] = useState(0)
  const [inputActivo, setInputActivo] = useState('')

  const fetch = async () => {
    const user = (await supabase.auth.getUser()).data.user
    const { data } = await supabase.from('saldos').select('*').eq('usuario_id', user.id)
    setSaldos(data || [])
  }

  useEffect(() => { fetch() }, [])

  const registrarSaldo = async (jugador, cambio) => {
    const user = (await supabase.auth.getUser()).data.user
    const existente = saldos.find(s => s.jugador === jugador)
    if (existente) {
      await supabase
        .from('saldos')
        .update({ saldo: existente.saldo + cambio })
        .eq('id', existente.id)
    } else {
      await supabase.from('saldos').insert([{ jugador, saldo: cambio, usuario_id: user.id }])
    }
    fetch()
  }

  return (
    <div className="bg-white shadow p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Saldos de jugadores</h2>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Nuevo jugador"
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          className="bg-green-600 text-white px-4 py-1 rounded"
          onClick={() => { registrarSaldo(nuevo, 0); setNuevo('') }}
        >Agregar</button>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Jugador</th>
            <th className="p-2">Saldo</th>
            <th className="p-2">Modificar</th>
          </tr>
        </thead>
        <tbody>
          {saldos.map((s, i) => (
            <tr key={i} className="even:bg-gray-100">
              <td className="p-2">{s.jugador}</td>
              <td className="p-2">${s.saldo}</td>
              <td className="p-2">
                <input
                  type="number"
                  value={inputActivo === s.jugador ? monto : ''}
                  onChange={(e) => { setMonto(+e.target.value); setInputActivo(s.jugador) }}
                  className="border px-2 py-1 w-20 mr-2 rounded"
                />
                <button className="bg-blue-600 text-white px-2 py-1 rounded mr-1" onClick={() => registrarSaldo(s.jugador, monto)}>+</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => registrarSaldo(s.jugador, -monto)}>-</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
