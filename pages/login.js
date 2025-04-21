// pages/login.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push('/dashboard')
    })
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let result
    if (isLogin) {
      result = await supabase.auth.signInWithPassword({ email, password })
    } else {
      result = await supabase.auth.signUp({ email, password })
    }

    if (result.error) setError(result.error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{isLogin ? 'Iniciar sesión' : 'Registrarse'}</h2>
      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : isLogin ? 'Ingresar' : 'Registrarse'}
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        {isLogin ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
        <button onClick={() => setIsLogin(!isLogin)} style={{ color: 'blue', background: 'none', border: 'none' }}>
          {isLogin ? 'Registrate acá' : 'Iniciar sesión'}
        </button>
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
