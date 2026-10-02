import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Lock, User, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react'
import { login, DEMO_ACCOUNTS, getAuthToken } from '../api/auth'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDemo, setSelectedDemo] = useState(null)

  useEffect(() => {
    if (getAuthToken()) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password')
      return
    }

    setLoading(true)
    setError('')

    const result = await login(username.trim(), password)
    setLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  const handleSelectDemo = async (account) => {
    setSelectedDemo(account.username)
    setUsername(account.username)
    setPassword(account.password)
    setError('')
    setLoading(true)

    const result = await login(account.username, account.password)
    setLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="login-container">
      <header className="login-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to overview
        </Link>
        <Link to="/" className="login-wordmark">
          DDrishti<span>Field media. Real evidence.</span>
        </Link>
      </header>

      <main className="login-main">
        <div className="login-card">
          <div className="login-form-pane">
            <div className="login-title-group">
              <span className="login-kicker">Welcome</span>
              <h1>Sign in to your account</h1>
              <p>Enter your details below to access your workspace and project files.</p>
            </div>

            {error && (
              <div className="login-alert error-alert" role="alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Username or Email</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. field_lead or ngo_director"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="button login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner" /> Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="security-notice">
              <ShieldCheck size={16} />
              <span>Protected by secure industry encryption.</span>
            </div>
          </div>

          <aside className="login-demo-pane">
            <div className="demo-pane-header">
              <h2>One-Click Demo Accounts</h2>
              <p>Click any role below to sign in instantly:</p>
            </div>

            <div className="demo-badges-list">
              {DEMO_ACCOUNTS.map((acc) => {
                const isActive = selectedDemo === acc.username
                return (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => handleSelectDemo(acc)}
                    disabled={loading}
                    className={`demo-badge-btn ${isActive ? 'is-active' : ''}`}
                  >
                    <div className="badge-avatar" style={{ backgroundColor: acc.color }}>
                      {acc.name.charAt(0)}
                    </div>
                    <div className="badge-meta">
                      <div className="badge-top">
                        <span className="badge-role">{acc.label}</span>
                        <span className="badge-username">@{acc.username}</span>
                      </div>
                      <span className="badge-fullname">{acc.name}</span>
                    </div>
                    <div className="badge-indicator">
                      {isActive && loading ? (
                        <Loader2 size={14} className="spinner" />
                      ) : (
                        <CheckCircle2 size={14} className="badge-arrow" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
