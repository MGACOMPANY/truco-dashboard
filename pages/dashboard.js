// pages/dashboard.js

const [rendimiento, setRendimiento] = useState([]);
const [actividad, setActividad] = useState([]);
const [ranking, setRanking] = useState([]);

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import ResumenMensual from '../components/ResumenMensual'
import DuelosDia from '../components/DuelosDia'
import FormularioDuelo from '../components/FormularioDuelo'
import Saldos from '../components/Saldos'
import ResumenVisual from '../components/ResumenVisual'
import BuscarJugador from '../components/BuscarJugador'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [vista, setVista] = useState('resumen')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) router.push('/login')
      else setUser(data.user)
    })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Dashboard Truco</h2>
        <nav className="space-y-2">
          <button onClick={() => setVista('resumen')} className="block w-full text-left hover:text-yellow-400">Resumen</button>
          <button onClick={() => setVista('duelos')} className="block w-full text-left hover:text-yellow-400">Cargar Duelos</button>
          <button onClick={() => setVista('saldos')} className="block w-full text-left hover:text-yellow-400">Saldos</button>
          <button onClick={() => setVista('buscar')} className="block w-full text-left hover:text-yellow-400">Buscar Jugador</button>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-end items-center gap-4 mb-6">
          {user && <span className="text-sm text-gray-600">Hola, {user.email}</span>}
          <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Cerrar sesión</button>
        </div>

        {vista === 'resumen' && (
          <>
            <ResumenMensual resumen={{ duelos: 0, entrada: 0, premio: 0, comision: 0 }} />
            <ResumenVisual />
          </>
        )}
        {vista === 'duelos' && (
          <>
            <FormularioDuelo />
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Duelos del día</h2>
              <DuelosDia />
            </div>
          </>
        )}
        {vista === 'saldos' && <Saldos usuario={user} />}
        {vista === 'buscar' && <BuscarJugador />}
      </main>
    </div>
  )
}
