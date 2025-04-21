// dashboard.js COMPLETO - incluye todo
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [duelos, setDuelos] = useState([])
  const [historial, setHistorial] = useState([])
  const [entrada, setEntrada] = useState('')
  const [jugadoresTexto, setJugadoresTexto] = useState('')
  const [jugadores, setJugadores] = useState([])
  const [ganador, setGanador] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [verHistorial, setVerHistorial] = useState(false)
  const [verSaldos, setVerSaldos] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [saldos, setSaldos] = useState([])
  const [montoEditar, setMontoEditar] = useState({})
  const [mensajeExito, setMensajeExito] = useState('')
  const [mensajeSaldos, setMensajeSaldos] = useState('')

  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else {
        setUserEmail(data.user.email)
        setUserId(data.user.id)
        fetchDuelos(data.user.id)
        fetchHistorial(data.user.id)
        fetchSaldos(data.user.id)
      }
    })
  }, [])

  const fetchDuelos = async (uid) => {
    const { data } = await supabase.from('duelos').select('*').eq('user_id', uid).order('fecha', { ascending: false })
    setDuelos(data || [])
  }

  const fetchHistorial = async (uid) => {
    const { data } = await supabase.from('historial_duelos').select('*').eq('user_id', uid).order('fecha', { ascending: false })
    setHistorial(data || [])
  }

  const fetchSaldos = async (uid) => {
    const { data } = await supabase.from('saldos').select('*').eq('user_id', uid)
    setSaldos(data || [])
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleJugadorChange = (e) => {
    const texto = e.target.value
    setJugadoresTexto(texto)
    const separados = texto.split(' ').filter(Boolean)
    setJugadores(separados.slice(0, 2))
    setGanador(null)
  }

  const seleccionarGanador = (index) => {
    setGanador(index)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (ganador === null) {
      alert('Debes seleccionar un ganador')
      return
    }
    setLoading(true)

    const entradaNum = parseInt(entrada)
    const premio = entradaNum * 2
    const comision = Math.round(premio * 0.05)
    const fecha = new Date().toISOString()

    const resultado = jugadores.map((j, i) => {
      if (i === ganador) return `✅ ${j}`
      if (i !== ganador) return `❌ ${j}`
      return j
    }).join(', ')

    const ganadorNombre = jugadores[ganador]
    const perdedorNombre = jugadores.find((_, i) => i !== ganador)
    const gananciaNeta = premio - entradaNum

    await supabase.from('duelos').insert([
      { tipo: '1 VS 1', entrada: entradaNum, premio, comision, jugadores: resultado, fecha, user_id: userId }
    ])

    const saldoGanador = saldos.find(s => s.nombre === ganadorNombre)
    const saldoPerdedor = saldos.find(s => s.nombre === perdedorNombre)

    if (saldoGanador) {
      await supabase.from('saldos').update({ saldo: saldoGanador.saldo + gananciaNeta }).eq('nombre', ganadorNombre).eq('user_id', userId)
    } else {
      await supabase.from('saldos').insert([{ nombre: ganadorNombre, saldo: gananciaNeta, user_id: userId }])
    }

    if (saldoPerdedor) {
      await supabase.from('saldos').update({ saldo: saldoPerdedor.saldo - entradaNum }).eq('nombre', perdedorNombre).eq('user_id', userId)
    } else {
      await supabase.from('saldos').insert([{ nombre: perdedorNombre, saldo: -entradaNum, user_id: userId }])
    }

    setEntrada('')
    setJugadoresTexto('')
    setJugadores([])
    setGanador(null)
    fetchDuelos(userId)
    fetchSaldos(userId)
    setMensajeExito('✔️ Duelo registrado y saldos actualizados correctamente')
    setTimeout(() => setMensajeExito(''), 4000)
    setLoading(false)
  }

  const archivarDuelosDelDia = async () => {
    const hoy = new Date().toLocaleDateString()
    const delDia = duelos.filter(d => new Date(d.fecha).toLocaleDateString() === hoy)
    const inserts = delDia.map(d => ({ ...d, user_id: userId }))
    if (inserts.length > 0) {
      await supabase.from('historial_duelos').insert(inserts)
      const ids = delDia.map(d => d.id)
      await supabase.from('duelos').delete().in('id', ids)
      fetchDuelos(userId)
      fetchHistorial(userId)
    }
  }

  const agregarSaldoUsuario = async () => {
    if (!nuevoNombre) return
    await supabase.from('saldos').insert([{ nombre: nuevoNombre, saldo: 0, user_id: userId }])
    setNuevoNombre('')
    fetchSaldos(userId)
  }

  const modificarSaldo = async (nombre, operacion) => {
    const monto = parseInt(montoEditar[nombre])
    if (!monto || isNaN(monto)) return
    const actual = saldos.find(s => s.nombre === nombre)
    const nuevoSaldo = operacion === 'sumar' ? actual.saldo + monto : actual.saldo - monto
    await supabase.from('saldos').update({ saldo: nuevoSaldo }).eq('nombre', nombre).eq('user_id', userId)
    fetchSaldos(userId)
    setMensajeSaldos(`✔️ Saldo ${operacion === 'sumar' ? 'cargado' : 'debitado'} correctamente a ${nombre}`)
    setTimeout(() => setMensajeSaldos(''), 4000)
  }

  const resumenPorDia = Object.values(duelos.reduce((acc, d) => {
    const fechaStr = new Date(d.fecha).toLocaleDateString()
    if (!acc[fechaStr]) acc[fechaStr] = { fecha: fechaStr, total: 0 }
    acc[fechaStr].total += d.entrada || 0
    return acc
  }, {}))

  const duelosDelDia = duelos.filter((d) => new Date(d.fecha).toLocaleDateString() === new Date().toLocaleDateString())

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <strong>Bienvenido: {userEmail}</strong>
        <div>
          <button onClick={() => setVerSaldos(!verSaldos)}>💰 Saldos</button>
          <button onClick={() => setVerHistorial(!verHistorial)} style={{ marginLeft: 10 }}>📚 Historial</button>
          <button onClick={archivarDuelosDelDia} style={{ marginLeft: 10 }}>📤 Archivar día</button>
          <button onClick={logout} style={{ marginLeft: 10 }}>Cerrar sesión</button>
        </div>
      </div>

      {mensajeExito && <p style={{ color: 'green' }}>{mensajeExito}</p>}

      {verSaldos ? (
        <div>
          <h2>💰 Saldos</h2>
          <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Nombre del jugador" />
          <button onClick={agregarSaldoUsuario}>Agregar</button>
          <table border="1" cellPadding="5" style={{ marginTop: 10 }}>
            <thead><tr><th>Jugador</th><th>Saldo</th><th>Modificar</th></tr></thead>
            <tbody>
              {saldos.map(s => (
                <tr key={s.id}>
                  <td>{s.nombre}</td>
                  <td>${s.saldo}</td>
                  <td>
                    <input type="number" style={{ width: '60px' }} value={montoEditar[s.nombre] || ''} onChange={(e) => setMontoEditar({ ...montoEditar, [s.nombre]: e.target.value })} />
                    <button onClick={() => modificarSaldo(s.nombre, 'sumar')}>➕</button>
                    <button onClick={() => modificarSaldo(s.nombre, 'restar')}>➖</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mensajeSaldos && <p style={{ color: 'green', marginTop: 10 }}>{mensajeSaldos}</p>}
        </div>
      ) : verHistorial ? (
        <div>
          <h2>📚 Historial</h2>
          {historial.length === 0 ? <p>No hay duelos archivados aún</p> : (
            <table border="1" cellPadding="5">
              <thead><tr><th>Tipo</th><th>Entrada</th><th>Premio</th><th>Comisión</th><th>Jugadores</th><th>Fecha</th></tr></thead>
              <tbody>
                {historial.map((duelo) => (
                  <tr key={duelo.id}>
                    <td>{duelo.tipo}</td>
                    <td>${duelo.entrada}</td>
                    <td>${duelo.premio}</td>
                    <td>${duelo.comision}</td>
                    <td>{duelo.jugadores}</td>
                    <td>{new Date(duelo.fecha).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <>
          <h2>Registrar Duelo</h2>
          <form onSubmit={handleSubmit}>
            <input type="number" placeholder="Entrada" value={entrada} onChange={(e) => setEntrada(e.target.value)} required />
            <input type="text" placeholder="Ej: martin tomas" value={jugadoresTexto} onChange={handleJugadorChange} required />
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              {jugadores.map((j, i) => (
                <div key={i} onClick={() => seleccionarGanador(i)} style={{ padding: '6px 12px', border: '1px solid gray', borderRadius: 5, cursor: 'pointer', backgroundColor: ganador === i ? 'lightgreen' : ganador !== null ? 'lightcoral' : 'white' }}>{j}</div>
              ))}
            </div>
            <button type="submit" disabled={loading} style={{ marginTop: 10 }}>{loading ? 'Guardando...' : 'Registrar'}</button>
          </form>

          <h3>Duelos del Día</h3>
          {duelosDelDia.length === 0 ? <p>No hay duelos hoy</p> : (
            <table border="1" cellPadding="5">
              <thead><tr><th>Tipo</th><th>Entrada</th><th>Premio</th><th>Comisión</th><th>Jugadores</th><th>Fecha</th></tr></thead>
              <tbody>
                {duelosDelDia.map((duelo) => (
                  <tr key={duelo.id}>
                    <td>{duelo.tipo}</td>
                    <td>${duelo.entrada}</td>
                    <td>${duelo.premio}</td>
                    <td>${duelo.comision}</td>
                    <td>{duelo.jugadores}</td>
                    <td>{new Date(duelo.fecha).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3 style={{ marginTop: 40 }}>📊 Total Entrada por Día</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resumenPorDia} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  )
}
