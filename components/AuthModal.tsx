import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { AuthMode, User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  initialMode?: AuthMode;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      if (mode === 'forgot-password') {
        alert("Quack! If an account exists, we sent a reset link to your email.");
        setMode('signin');
      } else {
        // Mock successful login
        onLogin({
          name: name || email.split('@')[0] || 'User',
          email: email
        });
        onClose();
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-br from-amber-600 to-orange-700 flex flex-col items-center justify-center text-white">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-1 hover:bg-black/20 rounded-full transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
            <div className="text-4xl mb-2">🦆</div>
            <h2 className="text-2xl font-bold tracking-tight">
                {mode === 'signin' && 'Welcome Back'}
                {mode === 'signup' && 'Join the Flock'}
                {mode === 'forgot-password' && 'Reset Password'}
            </h2>
        </div>

        {/* Body */}
        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {mode === 'signup' && (
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-400">Full Name</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-600"
                                placeholder="Donald Duck"
                                required
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-400">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-600"
                            placeholder="duck@pond.com"
                            required
                        />
                    </div>
                </div>

                {mode !== 'forgot-password' && (
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-400">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-4 mt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {mode === 'signin' && 'Sign In'}
                                {mode === 'signup' && 'Create Account'}
                                {mode === 'forgot-password' && 'Send Reset Link'}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    <div className="flex items-center justify-between text-sm text-slate-400">
                        {mode === 'signin' && (
                            <>
                                <button type="button" onClick={() => setMode('forgot-password')} className="hover:text-amber-500 transition-colors">
                                    Forgot password?
                                </button>
                                <button type="button" onClick={() => setMode('signup')} className="font-medium hover:text-amber-500 transition-colors">
                                    Create account
                                </button>
                            </>
                        )}
                        {mode === 'signup' && (
                             <div className="w-full text-center">
                                Already have an account?{' '}
                                <button type="button" onClick={() => setMode('signin')} className="font-medium text-amber-500 hover:text-amber-400 transition-colors">
                                    Sign in
                                </button>
                            </div>
                        )}
                        {mode === 'forgot-password' && (
                            <button type="button" onClick={() => setMode('signin')} className="w-full text-center hover:text-amber-500 transition-colors">
                                Back to Sign In
                            </button>
                        )}
                    </div>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;