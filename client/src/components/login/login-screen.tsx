import { useState } from 'react'
import { Eye, EyeOff, Lock, ArrowRight, Mail, X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import GoogleSvg from './google-svg';

interface LoginScreenProps {
    onSignIn: () => void
    onSkip?: () => void
}

export default function LoginScreen({ onSignIn, onSkip }: LoginScreenProps) {
    const [isSignUp, setIsSignUp] = useState(false)
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [resetEmailSent, setResetEmailSent] = useState(false)
    const [email, setEmail] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
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
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user || { email }))
                onSignIn()
            } else {
                const errorMsg = data.non_field_errors?.[0] ||
                    Object.values(data).flat()[0] ||
                    'Invalid credentials'
                setError(String(errorMsg))
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

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setIsLoading(false)
            return
        }

        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
            const response = await fetch(`${API_BASE}/api/auth/registration/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    password1: password,
                    password2: confirmPassword,
                    first_name: firstName,
                    last_name: lastName
                })
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user || { email, first_name: firstName, last_name: lastName }))
                onSignIn()
            } else {
                const errorMsg = data.non_field_errors?.[0] ||
                    Object.values(data).flat()[0] ||
                    'Registration failed'
                setError(String(errorMsg))
            }
        } catch (err) {
            setError('Failed to connect to server')
        } finally {
            setIsLoading(false)
        }
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
            const response = await fetch(`${API_BASE}/api/auth/password/reset/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            if (response.ok) {
                setResetEmailSent(true)
            } else {
                const data = await response.json()
                const errorMsg = Object.values(data).flat()[0] || 'Failed to send reset email'
                setError(String(errorMsg))
            }
        } catch (err) {
            setError('Failed to connect to server')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSocialSignIn = (provider: string) => {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
        window.location.href = `${API_BASE}/accounts/${provider}/login/`
    }

    const resetForm = () => {
        setIsForgotPassword(false)
        setResetEmailSent(false)
        setError('')
        setEmail('')
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
                                {isForgotPassword ? 'Reset your password' : isSignUp ? 'Create your account' : 'Welcome back'}
                            </h2>
                            <p className="text-slate-400 text-sm">
                                {isForgotPassword ? 'Enter your email to receive a password reset link' : isSignUp ? 'Sign up to get started' : 'Sign in to access your dashboard'}
                            </p>
                        </div>

                        {!isForgotPassword && (
                            <>
                                <div className="grid grid-cols-1 gap-2 mb-4">
                                    <Button
                                        onClick={() => handleSocialSignIn('google')}
                                        disabled={isLoading}
                                        variant="outline"
                                        size="sm"
                                        className="h-10 border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 p-2"
                                    >
                                        <GoogleSvg />
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
                            </>
                        )}

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {resetEmailSent ? (
                            <div className="space-y-4">
                                <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
                                    <p className="font-medium mb-1">Check your email</p>
                                    <p>We've sent a password reset link to <strong>{email}</strong></p>
                                </div>
                                <Button
                                    onClick={resetForm}
                                    variant="outline"
                                    className="w-full border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 text-slate-200"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to sign in
                                </Button>
                            </div>
                        ) : isForgotPassword ? (
                            <form onSubmit={handleForgotPassword} className="space-y-3">
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

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            Sending...
                                        </span>
                                    ) : (
                                        <>
                                            Send reset link
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="w-full text-sm text-slate-400 hover:text-slate-300 transition-colors"
                                >
                                    <ArrowLeft className="w-3 h-3 inline mr-1" />
                                    Back to sign in
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-3">
                                {isSignUp && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-sm text-slate-300">First Name</label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full h-10 px-3 rounded-lg bg-slate-700/30 border border-slate-600/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                placeholder="First name"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm text-slate-300">Last Name</label>
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="w-full h-10 px-3 rounded-lg bg-slate-700/30 border border-slate-600/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                placeholder="Last name"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

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

                                {isSignUp && (
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-sm text-slate-300">Confirm Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full h-10 pl-10 pr-10 rounded-lg bg-slate-700/30 border border-slate-600/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                    placeholder="Confirm your password"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="text-xs space-y-1 text-slate-400 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                                            <p className="font-medium text-slate-300 mb-2">Password requirements:</p>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-slate-600'}`} />
                                                <span className={password.length >= 8 ? 'text-green-400' : ''}>At least 8 characters</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${!/^\d+$/.test(password) && password.length > 0 ? 'bg-green-500' : 'bg-slate-600'}`} />
                                                <span className={!/^\d+$/.test(password) && password.length > 0 ? 'text-green-400' : ''}>Not entirely numeric</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!isSignUp && (
                                    <div className="flex items-center justify-end text-sm">
                                        <button
                                            type="button"
                                            onClick={() => setIsForgotPassword(true)}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            Forgot password?
                                        </button>
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
                        )}

                        {!isForgotPassword && !resetEmailSent && (
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
                        )}
                    </div>
                </div>

                <div className="text-center mt-6 text-slate-500 text-sm">
                    <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
                </div>
            </div>
        </div>
    )
}
