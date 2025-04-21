// components/ResumenVisual.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { utils, writeFile } from 'xlsx'

export default function ResumenVisual() {
  const [datos, setDatos] = useState([])
  const [ranking, setRanking] = useState([])
  const [tipos, setTipos] = useState([])
  const [actividad, setActividad] = useState([])
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [rawData, setRawData] = useState([])

  useEffect(() => {
    fetchDatos()
  }, [desde, hasta])

  const fetchDatos = async () => {
    const user = (await supabase.auth.getUser()).data.user
    let query = supabase.from('duelos').select('*').eq('usuario_id', user.id)
    if (desde) query = query.gte('fecha', desde + 'T00:00:00')
    if (hasta) query = query.lte('fecha', hasta + 'T23:59:59')
    const { data } = await query
    if (!data) return
    setRawData(data)
  
    const agrupado = {}
    data.forEach((d) => {
      const fecha = d.fecha.split('T')[0]
      if (!agrupado[fecha]) agrupado[fecha] = { fecha, entrada: 0, premio: 0, comision: 0 }
      agrupado[fecha].entrada += d.entrada
      agrupado[fecha].premio += d.premio
      agrupado[fecha].comision += d.comision
    })
    setDatos(Object.values(agrupado))
  
    const acumulado = {}
    const actividadTemp = {}
    data.forEach((d) => {
      d.jugadores.split(' vs ').forEach((j) => {
        if (!acumulado[j]) acumulado[j] = 0
        acumulado[j] += d.premio - d.entrada
  
        if (!actividadTemp[j]) actividadTemp[j] = 0
        actividadTemp[j]++
      })
    })
    const ordenado = Object.entries(acumulado)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
    setRanking(ordenado)
  
    const actividadOrdenada = Object.entries(actividadTemp)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
    setActividad(actividadOrdenada)
  
    const rendimientoTemp = {}
    data.forEach((d) => {
      const lista = d.jugadores.split(' vs ')
      if (lista.length === 2 && d.premio && d.entrada) {
        const diferencia = d.premio - d.entrada
        const ganador = lista.find((j) => {
          const saldoGanancia = acumulado[j] ?? 0
          return saldoGanancia >= diferencia
        })
        const perdedor = lista.find((j) => j !== ganador)
  
        if (ganador) {
          rendimientoTemp[ganador] = rendimientoTemp[ganador] || { ganadas: 0, perdidas: 0 }
          rendimientoTemp[ganador].ganadas++
        }
        if (perdedor) {
          rendimientoTemp[perdedor] = rendimientoTemp[perdedor] || { ganadas: 0, perdidas: 0 }
          rendimientoTemp[perdedor].perdidas++
        }
      }
    })
    setRendimiento(Object.entries(rendimientoTemp).map(([name, val]) => ({ name, ...val })))
  

    const cuentaTipos = { '1 VS 1': 0, '2 VS 2': 0, '3 VS 3': 0 }
    data.forEach(d => { if (cuentaTipos[d.tipo]) cuentaTipos[d.tipo]++ })
    const tipoData = Object.entries(cuentaTipos).map(([name, value]) => ({ name, value }))
    setTipos(tipoData)
  }
  

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Resumen Mensual - Truco', 14, 20)

    autoTable(doc, {
      startY: 30,
      head: [['Fecha', 'Entrada', 'Premio', 'Comisión']],
      body: datos.map((d) => [d.fecha, `$${d.entrada}`, `$${d.premio}`, `$${d.comision}`])
    })

    doc.addPage()
    doc.setFontSize(16)
    doc.text('Top Jugadores', 14, 20)
    autoTable(doc, {
      startY: 30,
      head: [['Posición', 'Jugador', 'Ganancia neta']],
      body: ranking.map((j, i) => [i + 1, j.name, `$${j.value}`])
    })

    doc.save('reporte-truco.pdf')
  }

  const exportarExcel = () => {
    const worksheet = utils.json_to_sheet(rawData.map(d => ({
      Fecha: d.fecha.split('T')[0],
      Tipo: d.tipo,
      Entrada: d.entrada,
      Premio: d.premio,
      Comisión: d.comision,
      Jugadores: d.jugadores
    })))
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Duelos')
    writeFile(workbook, 'historial-duelos.xlsx')
  }

  const COLORS = ['#8884d8', '#82ca9d', '#f87171']

  return (
    <div className="mt-6 space-y-8">
      <div className="flex justify-between items-end mb-4 gap-4 flex-wrap">
        <div className="flex flex-wrap gap-2">
          <div>
            <label className="text-sm">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="text-sm">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportarPDF}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Exportar PDF
          </button>
          <button
            onClick={exportarExcel}
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
          >
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="w-full h-64 bg-white rounded shadow p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos}>
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="entrada" fill="#8884d8" name="Entradas" />
            <Bar dataKey="premio" fill="#82ca9d" name="Premios" />
            <Bar dataKey="comision" fill="#f87171" name="Comisión" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-bold mb-4">🎯 Tipos de Duelos Jugados</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={tipos}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {tipos.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-bold mb-2">🏆 Top Ganadores</h2>
        <ul className="space-y-1">
          {ranking.slice(0, 5).map((j, i) => (
            <li key={i} className="flex justify-between">
              <span>{i + 1}. {j.name}</span>
              <span className="text-green-600 font-semibold">${j.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded shadow p-4">
  <h2 className="text-xl font-bold mb-2">🎮 Jugadores Más Activos</h2>
  <ul className="space-y-1">
    {actividad.slice(0, 5).map((j, i) => (
      <li key={i} className="flex justify-between">
        <span>{i + 1}. {j.name}</span>
        <span className="text-blue-700 font-semibold">{j.value} duelos</span>
      </li>
    ))}
  </ul>
</div>

<div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-bold mb-2">📈 Rendimiento por Jugador</h2>
        <ul className="space-y-1">
          {rendimiento
            .sort((a, b) => (b.ganadas + b.perdidas) - (a.ganadas + a.perdidas))
            .slice(0, 10)
            .map((j, i) => (
              <li key={i} className="flex justify-between">
                <span>{i + 1}. {j.name}</span>
                <span className="text-sm">✅ {j.ganadas} / ❌ {j.perdidas}</span>
              </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
