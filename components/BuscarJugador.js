// components/BuscarJugador.js
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function BuscarJugador() {
  const [nombre, setNombre] = useState('')
  const [resultados, setResultados] = useState([])
  const [gananciaTotal, setGananciaTotal] = useState(0)
  const [saldoActual, setSaldoActual] = useState(null)

  const buscar = async () => {
    if (!nombre) return

    const user = (await supabase.auth.getUser()).data.user

    const { data: duelos } = await supabase
      .from('duelos')
      .select('*')
      .eq('usuario_id', user.id)

    const jugados = duelos.filter(d => d.jugadores.toLowerCase().includes(nombre.toLowerCase()))

    setResultados(jugados)

    const totalGanancia = jugados.reduce((acc, d) => acc + (d.premio - d.entrada), 0)
    setGananciaTotal(totalGanancia)

    const { data: saldo } = await supabase
      .from('saldos')
      .select('saldo')
      .eq('usuario_id', user.id)
      .eq('nombre', nombre)
      .single()

    setSaldoActual(saldo?.saldo ?? null)
  }

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-2">🔍 Buscar Jugador</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Ej: martin"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border px-2 py-1 rounded w-full sm:w-auto"
        />
        <button
          onClick={buscar}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      {resultados.length > 0 && (
        <>
          <p className="text-green-700 font-semibold mb-2">Ganancia total: ${gananciaTotal}</p>
          {saldoActual !== null && (
            <p className="text-blue-700 mb-2">Saldo actual: ${saldoActual}</p>
          )}

          <div className="overflow-auto max-h-60">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Fecha</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Entrada</th>
                  <th className="p-2">Premio</th>
                  <th className="p-2">Jugadores</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((d, i) => (
                  <tr key={i} className="even:bg-gray-100">
                    <td className="p-2">{d.fecha.split('T')[0]}</td>
                    <td className="p-2">{d.tipo}</td>
                    <td className="p-2">${d.entrada}</td>
                    <td className="p-2">${d.premio}</td>
                    <td className="p-2">{d.jugadores}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
