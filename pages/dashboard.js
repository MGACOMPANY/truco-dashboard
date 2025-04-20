import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import DuelosTable from '../components/DuelosTable'
import ResumenDiario from '../components/ResumenDiario'

export default function Dashboard() {
  const [duelos, setDuelos] = useState([])
  const [resumen, setResumen] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const { data: duelosData } = await supabase.from('duelos').select('*')
      const { data: resumenData } = await supabase.from('resumen_diario').select('*').order('fecha', { ascending: false }).limit(1)

      setDuelos(duelosData || [])
      setResumen(resumenData?.[0] || null)
    }
    fetchData()
  }, [])

  return (
    <div>
      <h1>Dashboard Truco</h1>
      <ResumenDiario data={resumen} />
      <DuelosTable data={duelos} />
    </div>
  )
}
