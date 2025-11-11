import { useState } from 'react'
import { Eye, EyeOff, User, Lock, ArrowRight, Mail, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import GoogleSvg from './google-svg';
import FacebookSvg from './facebook-svg';
import MicrosoftSvg from './microsoft-svg';

interface LoginScreenProps {
  onSignIn: () => void
  onSkip?: () => void
}

export default function LoginScreen({ onSignIn, onSkip }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
      const response = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(data.user))
        onSignIn()
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
      const response = await fetch(`${API_BASE}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      })

      const data = await response.json()

      if (data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(data.user))
        onSignIn()
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = () => {
    setError('Social sign-in coming soon!')
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <div className="text-center space-y-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '300', letterSpacing: '-0.02em' }}>
              MacroDash
            </h1>
            <p className="text-slate-400 text-lg">Professional Financial Analytics</p>
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl p-6 relative">
          {onSkip && (
            <Button
              onClick={onSkip}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-xl font-semibold text-white">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-slate-400 text-sm">
                {isSignUp ? 'Sign up to get started' : 'Sign in to access your dashboard'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                onClick={handleSocialSignIn}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="h-10 border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 p-2"
              >
                <GoogleSvg />
              </Button>

              <Button
                onClick={handleSocialSignIn}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="h-10 border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 p-2"
              >
                <FacebookSvg />
              </Button>

              <Button
                onClick={handleSocialSignIn}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="h-10 border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 p-2"
              >
                <MicrosoftSvg />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600/50"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-slate-800/60 text-slate-400">or continue with email</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded-lg bg-slate-700/30 border border-slate-600/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 pl-10 pr-3 rounded-lg bg-slate-700/30 border border-slate-600/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-10 pr-10 rounded-lg bg-slate-700/30 border border-slate-600/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                    <input type="checkbox" className="rounded border-slate-600 bg-slate-700/30" />
                    Remember me
                  </label>
                  <a href="#" className="text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </a>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    {isSignUp ? 'Creating account...' : 'Signing in...'}
                  </span>
                ) : (
                  <>
                    {isSignUp ? 'Create account' : 'Sign in'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-slate-500 text-sm">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}
