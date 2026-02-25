import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/client'
import { Leaf, Loader2, LogIn } from 'lucide-react'

export default function LoginPage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await login(username, password)
            localStorage.setItem('gc_token', res.token)
            localStorage.setItem('gc_user', JSON.stringify({
                username, role: res.role, displayName: res.displayName,
            }))
            navigate('/')
        } catch {
            setError('Invalid username or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-campus-50 via-white to-campus-100">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-campus-500 to-campus-700 rounded-2xl flex items-center justify-center shadow-lg shadow-campus-500/30">
                        <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">GreenCampus</h1>
                        <p className="text-[10px] font-medium text-campus-600 uppercase tracking-widest">Rooms</p>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Welcome back</h2>
                    <p className="text-sm text-gray-500 mb-6">Sign in to manage campus rooms</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-campus-500/30 focus:border-campus-400 transition-all"
                                placeholder="admin"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-campus-500/30 focus:border-campus-400 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 text-xs font-medium px-4 py-2.5 rounded-xl border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !username || !password}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-campus-500 to-campus-600 text-white text-sm font-bold rounded-xl hover:from-campus-600 hover:to-campus-700 transition-all shadow-md shadow-campus-500/20 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                            Sign In
                        </button>
                    </form>
                </div>

                {/* Demo credentials */}
                <div className="mt-4 bg-white/60 rounded-xl border border-gray-200 p-4 text-xs text-gray-500">
                    <p className="font-semibold text-gray-700 mb-2">Demo Accounts</p>
                    <div className="space-y-1 font-mono text-[11px]">
                        <p><span className="text-campus-600 font-bold">admin</span> / admin123 — Full access</p>
                        <p><span className="text-blue-600 font-bold">tech</span> / tech123 — Technician</p>
                        <p><span className="text-amber-600 font-bold">staff</span> / staff123 — Teaching Staff</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
