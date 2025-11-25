import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'

interface SignInPageProps {
  onSignIn: () => void
}

export function SignInPage({ onSignIn }: SignInPageProps) {
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

  const handleSocialSignIn = (provider: string) => {
    setIsLoading(true)
    // Simulate social sign in
    setTimeout(() => {
      setIsLoading(false)
      onSignIn()
    }, 1000)
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6 h-screen">
      <div className="w-full max-w-md">
        
        {/* Title Only */}
        <div className="text-center space-y-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '300', letterSpacing: '-0.02em' }}>
              MacroDash
            </h1>
            <p className="text-slate-400 text-lg">Professional Financial Analytics</p>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl p-6">
          <div className="space-y-4">
            
            {/* Welcome Text */}
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-xl font-semibold text-white">Welcome back</h2>
              <p className="text-slate-400 text-sm">Sign in to access your dashboard</p>
            </div>

            {/* Social Sign In Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                onClick={() => handleSocialSignIn('google')}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="h-10 border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 p-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </Button>

              <Button
                onClick={() => handleSocialSignIn('facebook')}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="h-10 border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 p-2"
              >
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Button>

              <Button
                onClick={() => handleSocialSignIn('microsoft')}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="h-10 border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 p-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#f25022" d="M1 1h10v10H1z"/>
                  <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                  <path fill="#7fba00" d="M1 13h10v10H1z"/>
                  <path fill="#ffb900" d="M13 13h10v10H13z"/>
                </svg>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600/50"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-slate-800/60 text-slate-400">or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSignIn} className="space-y-3">
              {/* Email Input */}
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

              {/* Password Input */}
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

              {/* Remember Me & Forgot Password */}
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

              {/* Sign In Button */}
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

            {/* Sign Up Link */}
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

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 mt-4">
          <p>© 2024 MacroDash. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
