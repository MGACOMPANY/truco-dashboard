// components/FormularioDuelo.js
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import NotificacionFlotante from './NotificacionFlotante'
import { motion } from 'framer-motion'

export default function FormularioDuelo() {
  const [entrada, setEntrada] = useState('')
  const [jugadores, setJugadores] = useState('')
  const [ganadorIndex, setGanadorIndex] = useState(null)
  const [tipo, setTipo] = useState('1 VS 1')
  const [mensaje, setMensaje] = useState('')
  const [notifVisible, setNotifVisible] = useState(false)

  const registrarDuelo = async () => {
    const lista = jugadores.split(' ').filter(Boolean)
    if (!entrada || lista.length < 2) return alert('Completa entrada y 2 jugadores')

    const entradaNum = parseInt(entrada)
    const premio = entradaNum * 2 - Math.round(entradaNum * 2 * 0.05)
    const comision = Math.round(entradaNum * 2 * 0.05)

    const user = (await supabase.auth.getUser()).data.user
    const fecha = new Date().toISOString()

    const duelo = {
      tipo,
      entrada: entradaNum,
      premio,
      comision,
      jugadores: lista.join(' vs '),
      fecha,
      usuario_id: user.id
    }

    await supabase.from('duelos').insert([duelo])
    await supabase.from('historial_duelos').insert([duelo])

    let notif = ''

    if (ganadorIndex !== null) {
      const ganador = lista[ganadorIndex]
      const perdedor = lista.find((_, i) => i !== ganadorIndex)
      const ganancia = premio - entradaNum

      const { data: saldoGanador } = await supabase
        .from('saldos')
        .select('*')
        .eq('nombre', ganador)
        .eq('usuario_id', user.id)

      if (saldoGanador.length) {
        await supabase
          .from('saldos')
          .update({ saldo: saldoGanador[0].saldo + ganancia })
          .eq('id', saldoGanador[0].id)
      } else {
        await supabase
          .from('saldos')
          .insert([{ nombre: ganador, saldo: ganancia, usuario_id: user.id }])
      }

      const { data: saldoPerdedor } = await supabase
        .from('saldos')
        .select('*')
        .eq('nombre', perdedor)
        .eq('usuario_id', user.id)

      if (saldoPerdedor.length) {
        await supabase
          .from('saldos')
          .update({ saldo: saldoPerdedor[0].saldo - entradaNum })
          .eq('id', saldoPerdedor[0].id)
      } else {
        await supabase
          .from('saldos')
          .insert([{ nombre: perdedor, saldo: -entradaNum, usuario_id: user.id }])
      }

      notif = `✅ Saldos actualizados: ${ganador} +${ganancia} / ${perdedor} -${entradaNum}`
    }

    setEntrada('')
    setJugadores('')
    setGanadorIndex(null)
    setMensaje(notif)
    if (notif) setNotifVisible(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-4"
    >
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Registrar duelo</h3>
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input
          type="number"
          placeholder="Entrada"
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          placeholder="Ej: martin tomas"
          value={jugadores}
          onChange={(e) => setJugadores(e.target.value)}
          className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-700 dark:text-white"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-700 dark:text-white"
        >
          <option value="1 VS 1">1 VS 1</option>
          <option value="2 VS 2">2 VS 2</option>
          <option value="3 VS 3">3 VS 3</option>
        </select>
      </div>
      <div className="flex gap-2 my-2 flex-wrap">
        {jugadores.split(' ').filter(Boolean).map((j, i) => (
          <button
            key={i}
            onClick={() => setGanadorIndex(i)}
            className={`px-3 py-1 rounded border ${ganadorIndex === i ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600 dark:text-white'}`}
          >
            {j}
          </button>
        ))}
      </div>
      <button
        onClick={registrarDuelo}
        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
      >
        Guardar
      </button>

      <NotificacionFlotante
        mensaje={mensaje}
        visible={notifVisible}
        onClose={() => setNotifVisible(false)}
      />
    </motion.div>
  )
}
