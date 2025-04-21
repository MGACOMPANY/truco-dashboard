// components/FormularioDuelo.js
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function FormularioDuelo() {
  const [entrada, setEntrada] = useState('')
  const [jugadores, setJugadores] = useState('')
  const [mensaje, setMensaje] = useState('')

  const registrarDuelo = async () => {
    const lista = jugadores.split(' ').filter(Boolean)
    if (!entrada || lista.length < 2) return alert('Completa entrada y 2 jugadores')

    const tipo = `${lista.length} VS ${lista.length}`
    const entradaNum = parseInt(entrada)
    const premio = entradaNum * 2 - Math.round(entradaNum * 2 * 0.05)
    const comision = Math.round(entradaNum * 2 * 0.05)

    const user = (await supabase.auth.getUser()).data.user

    const duelo = {
      tipo,
      entrada: entradaNum,
      premio,
      comision,
      jugadores: lista.join(' vs '),
      fecha: new Date().toISOString(),
      usuario_id: user.id
    }

    await supabase.from('duelos').insert([duelo])
    await supabase.from('historial_duelos').insert([duelo])

    setEntrada('')
    setJugadores('')
    setMensaje('✅ Duelo registrado')
    setTimeout(() => setMensaje(''), 3000)
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">Registrar duelo</h3>
      <input
        type="number"
        placeholder="Entrada"
        value={entrada}
        onChange={(e) => setEntrada(e.target.value)}
        className="border px-2 py-1 mr-2 rounded"
      />
      <input
        type="text"
        placeholder="Ej: martin tomas"
        value={jugadores}
        onChange={(e) => setJugadores(e.target.value)}
        className="border px-2 py-1 mr-2 rounded"
      />
      <button
        onClick={registrarDuelo}
        className="bg-blue-600 text-white px-4 py-1 rounded"
      >
        Guardar
      </button>
      {mensaje && <p className="mt-2 text-green-600">{mensaje}</p>}
    </div>
  )
}
