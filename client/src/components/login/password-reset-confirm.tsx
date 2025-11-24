import { useState } from 'react';
import { Eye, EyeOff, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PasswordResetConfirmProps {
    uid: string;
    token: string;
    onSuccess: () => void;
}

export default function PasswordResetConfirm({ uid, token, onSuccess }: PasswordResetConfirmProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
            const response = await fetch(`${API_BASE}/api/auth/password/reset/confirm/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid,
                    token,
                    new_password1: newPassword,
                    new_password2: confirmPassword,
                }),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            } else {
                const data = await response.json();
                const errorMsg = Object.values(data).flat()[0] || 'Failed to reset password';
                setError(String(errorMsg));
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

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
                            <h2 className="text-xl font-semibold text-white">Set new password</h2>
                            <p className="text-slate-400 text-sm">Enter your new password below</p>
                        </div>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        {success ? (
                            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
                                <p className="font-medium mb-1">Password reset successful!</p>
                                <p>Redirecting to the dashboard...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-300">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full h-10 pl-10 pr-10 rounded-lg bg-slate-700/30 border border-slate-600/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            placeholder="Enter new password"
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
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-300">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full h-10 pl-10 pr-10 rounded-lg bg-slate-700/30 border border-slate-600/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            placeholder="Confirm new password"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="text-xs space-y-1 text-slate-400 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                                    <p className="font-medium text-slate-300 mb-2">Password requirements:</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-slate-600'}`} />
                                        <span className={newPassword.length >= 8 ? 'text-green-400' : ''}>At least 8 characters</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${!/^\d+$/.test(newPassword) && newPassword.length > 0 ? 'bg-green-500' : 'bg-slate-600'}`} />
                                        <span className={!/^\d+$/.test(newPassword) && newPassword.length > 0 ? 'text-green-400' : ''}>Not entirely numeric</span>
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
                                            Resetting password...
                                        </span>
                                    ) : (
                                        <>
                                            Reset password
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
                <div className="text-center mt-6 text-slate-500 text-sm">
                    <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
                </div>
            </div>
        </div>
    );
}
