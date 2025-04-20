import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { tipo, entrada, premio, jugadores, comision, fecha, grupo } = req.body

    const { data, error } = await supabase.from('duelos').insert([
      { tipo, entrada, premio, jugadores, comision, fecha, grupo }
    ])

    if (error) return res.status(500).json({ error })
    res.status(200).json({ message: 'Duel registered', data })
  } else {
    res.status(405).end()
  }
}
