import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import { AuthMode, User } from '../types';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        // Login successful, App.tsx onAuthStateChanged will handle the state update
      } else if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile with name if provided
        if (name) {
          await updateProfile(userCredential.user, {
            displayName: name
          });
        }
        // Signup successful, App.tsx onAuthStateChanged will handle the state update
      } else if (mode === 'forgot-password') {
        await sendPasswordResetEmail(auth, email);
        alert("Quack! If an account exists, we sent a reset link to your email.");
        setMode('signin');
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      
      // Handle specific error codes
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        setError("Email or password is incorrect");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("User already exists. Please sign in");
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        // Auth state listener handles the rest
    } catch (err: any) {
        console.error("Google Auth Error:", err);
        if (err.code === 'auth/popup-closed-by-user') {
            return; // User just closed the popup, no need to show error
        }
        setError("Failed to sign in with Google. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden selection:bg-amber-500/30 text-slate-200 font-sans">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in duration-500">
        
        {/* Brand Header */}
        <div className="text-center mb-10">
            <div className="mx-auto w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-black/50 mb-6 group transform hover:scale-105 transition-transform duration-300">
                <span className="text-4xl group-hover:rotate-12 transition-transform duration-300">🦆</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                File<span className="text-amber-500">Duck</span>
            </h1>
            <p className="text-slate-500 text-sm">
                Your intelligent AI file assistant.
            </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6">
                {mode === 'signin' && 'Sign in to your account'}
                {mode === 'signup' && 'Create a new account'}
                {mode === 'forgot-password' && 'Reset your password'}
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            
            {/* Google Sign In Button */}
            {mode !== 'forgot-password' && (
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-white text-slate-900 font-semibold rounded-xl shadow-lg hover:shadow-white/10 hover:bg-slate-100 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign in with Google
                            </>
                        )}
                    </button>
                    
                    <div className="relative flex items-center gap-3 py-6">
                        <div className="flex-grow border-t border-slate-700"></div>
                        <span className="flex-shrink-0 text-slate-500 text-xs uppercase tracking-wider">Or continue with</span>
                        <div className="flex-grow border-t border-slate-700"></div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {mode === 'signup' && (
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400 ml-1 uppercase tracking-wider">Full Name</label>
                        <div className="relative group">
                            <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-700"
                                placeholder="Donald Duck"
                                required
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 ml-1 uppercase tracking-wider">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-700"
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                </div>

                {mode !== 'forgot-password' && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-slate-400 ml-1 uppercase tracking-wider">Password</label>
                            {mode === 'signin' && (
                                <button 
                                    type="button" 
                                    onClick={() => { setMode('forgot-password'); setError(null); }}
                                    className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            )}
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-700"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4 transform active:scale-[0.98]"
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
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                {mode === 'signin' && (
                    <p className="text-sm text-slate-400">
                        Don't have an account?{' '}
                        <button onClick={() => { setMode('signup'); setError(null); }} className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
                            Sign up
                        </button>
                    </p>
                )}
                {mode === 'signup' && (
                    <p className="text-sm text-slate-400">
                        Already have an account?{' '}
                        <button onClick={() => { setMode('signin'); setError(null); }} className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
                            Sign in
                        </button>
                    </p>
                )}
                {mode === 'forgot-password' && (
                    <button onClick={() => { setMode('signin'); setError(null); }} className="text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 mx-auto transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Sign In
                    </button>
                )}
            </div>
        </div>
        
        <p className="text-center text-xs text-slate-600 mt-8">
            &copy; {new Date().getFullYear()} FileDuck. All rights reserved.
        </p>

      </div>
    </div>
  );
};

export default AuthPage;