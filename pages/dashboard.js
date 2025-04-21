// pages/dashboard.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [duelos, setDuelos] = useState([])
  const [entrada, setEntrada] = useState('')
  const [jugadores, setJugadores] = useState('')
  const [fecha, setFecha] = useState('')
  const router = useRouter()

  const user = supabase.auth.getUser()

  const fetchDuelos = async () => {
    const { data } = await supabase
      .from('duelos')
      .select('*')
      .eq('usuario_id', user.id)
      .order('fecha', { ascending: false })
    setDuelos(data || [])
  }

  useEffect(() => {
    fetchDuelos()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!entrada || !jugadores || !fecha) return alert('Todos los campos son obligatorios')

    const entradaVal = parseInt(entrada.replace(/\D/g, ''))
    const premio = entradaVal * 2
    const comision = Math.round(premio * 0.05)

    const { error } = await supabase.from('duelos').insert({
      tipo: 'MANUAL',
      entrada: entradaVal,
      premio,
      jugadores,
      comision,
      fecha,
      usuario_id: user.id,
      grupo: 'Manual'
    })

    if (error) return alert('Error al guardar')

    setEntrada('')
    setJugadores('')
    setFecha('')
    fetchDuelos()
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard Truco</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input placeholder="Entrada" value={entrada} onChange={e => setEntrada(e.target.value)} />
        <input placeholder="Jugadores" value={jugadores} onChange={e => setJugadores(e.target.value)} />
        <input type="datetime-local" value={fecha} onChange={e => setFecha(e.target.value)} />
        <button type="submit">Registrar</button>
      </form>

      <table border="1">
        <thead>
          <tr>
            <th>Tipo</th><th>Entrada</th><th>Premio</th><th>Jugadores</th><th>Comisión</th><th>Fecha</th><th>Grupo</th>
          </tr>
        </thead>
        <tbody>
          {duelos.map((d, i) => (
            <tr key={i}>
              <td>{d.tipo}</td>
              <td>${d.entrada}</td>
              <td>${d.premio}</td>
              <td>{d.jugadores}</td>
              <td>${d.comision}</td>
              <td>{d.fecha}</td>
              <td>{d.grupo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
