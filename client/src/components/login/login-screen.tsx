import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import GoogleSvg from './google-svg';
import FacebookSvg from './facebook-svg';
import MicrosoftSvg from './microsoft-svg';

interface LoginScreenProps {
  onSignIn: () => void
}

export default function LoginScreen({ onSignIn }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onSignIn()
    }, 1500)
  }

  const handleSocialSignIn = () => {
    setIsLoading(true)
    // Simulate social sign in until backend is built
    setTimeout(() => {
      setIsLoading(false)
      onSignIn()
    }, 1000)
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

        <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl p-6">
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-xl font-semibold text-white">Welcome back</h2>
              <p className="text-slate-400 text-sm">Sign in to access your dashboard</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                onClick={() => handleSocialSignIn()}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="h-10 border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 p-2"
              >
                <GoogleSvg />
              </Button>

              <Button
                onClick={() => handleSocialSignIn()}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="h-10 border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 p-2"
              >
                <FacebookSvg />
              </Button>

              <Button
                onClick={() => handleSocialSignIn()}
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

            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-600 text-green-600 focus:ring-green-500 bg-slate-700"
                  />
                  <span className="text-xs text-slate-300">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign in to Dashboard
                    <ArrowRight size={16} />
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-slate-400 text-xs">
                Don't have an account?{' '}
                <button className="text-green-400 hover:text-green-300 font-medium transition-colors">
                  Create account
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 mt-4">
          <p>© 2025 MacroDash. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
