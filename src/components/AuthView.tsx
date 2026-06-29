import React, { useState } from 'react';
import { 
  Mail, Lock, User as UserIcon, LogIn, UserPlus, Key, 
  ArrowLeft, CheckCircle2, ShieldCheck, RefreshCw, LogOut, Sparkles, CloudCheck
} from 'lucide-react';
import { 
  signUpWithEmailAndPassword, 
  loginWithEmailAndPassword, 
  sendPasswordReset 
} from '../lib/googleAuth';

interface AuthViewProps {
  googleUser: any;
  onGoogleSignIn: () => void;
  onGoogleLogout: () => void;
  streak: number;
  xp: number;
  level: number;
}

export default function AuthView({
  googleUser,
  onGoogleSignIn,
  onGoogleLogout,
  streak,
  xp,
  level
}: AuthViewProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot' | 'profile'>(
    googleUser ? 'profile' : 'signin'
  );

  // Email/Password form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset errors and messages when switching modes
  const handleSwitchMode = (mode: 'signin' | 'signup' | 'forgot' | 'profile') => {
    setAuthMode(mode);
    setError(null);
    setSuccessMessage(null);
    setPassword('');
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await signUpWithEmailAndPassword(email, password, displayName);
      setSuccessMessage('Account created successfully! Welcome to Mappy!');
      // Firebase onAuthStateChanged will handle setting the user state in App.tsx
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. Email may already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await loginWithEmailAndPassword(email, password);
      setSuccessMessage('Logged in successfully!');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordReset(email);
      setSuccessMessage('Password reset link sent to your email! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  // If user state changed to logged in, switch to profile view
  React.useEffect(() => {
    if (googleUser) {
      setAuthMode('profile');
    } else if (authMode === 'profile') {
      setAuthMode('signin');
    }
  }, [googleUser]);

  return (
    <div className="max-w-md mx-auto my-6" id="mappy-auth-panel">
      {/* Active Profile State */}
      {authMode === 'profile' && googleUser ? (
        <div className="bg-white border border-stone-100 shadow-xl rounded-2xl p-6 space-y-6">
          <div className="text-center space-y-3">
            <div className="relative inline-block">
              {googleUser.photoURL ? (
                <img 
                  src={googleUser.photoURL} 
                  alt="Profile" 
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full mx-auto border-2 border-[#6366F1] shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white text-2xl font-black shadow-md">
                  {googleUser.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full border-2 border-white shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            <div>
              <h2 className="text-lg font-space font-extrabold text-[#0A1128]">
                {googleUser.displayName || 'Mappy Scholar'}
              </h2>
              <p className="text-xs text-stone-400 font-medium">{googleUser.email}</p>
            </div>
          </div>

          {/* Sync Stats */}
          <div className="grid grid-cols-3 gap-3 text-center bg-stone-50/60 p-3 rounded-xl border border-stone-100">
            <div>
              <span className="text-[10px] font-space font-extrabold text-stone-400 uppercase tracking-wider block">Level</span>
              <span className="text-sm font-space font-black text-indigo-600">{level}</span>
            </div>
            <div>
              <span className="text-[10px] font-space font-extrabold text-stone-400 uppercase tracking-wider block">XP</span>
              <span className="text-sm font-space font-black text-indigo-600">{xp}</span>
            </div>
            <div>
              <span className="text-[10px] font-space font-extrabold text-stone-400 uppercase tracking-wider block">Streak</span>
              <span className="text-sm font-space font-black text-amber-500">🔥 {streak} Days</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-start gap-2.5">
            <span className="p-1 bg-emerald-100 text-emerald-700 rounded-lg mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-emerald-900 block">Cloud Backup Sync Active</span>
              <span className="text-[10px] text-emerald-700/80 font-medium leading-relaxed block">
                Your study history, custom sub-steps, XP, and streaks are securely saved. Log in on any device to resume your work instantly!
              </span>
            </div>
          </div>

          <button
            onClick={onGoogleLogout}
            className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-800 border border-stone-200 hover:border-stone-300 rounded-xl text-xs font-space font-extrabold uppercase tracking-wider cursor-pointer transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of Account
          </button>
        </div>
      ) : (
        /* Sign In / Sign Up Forms */
        <div className="bg-white border border-stone-100 shadow-xl rounded-2xl p-6 space-y-6">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 bg-indigo-50 text-[#6366F1] border border-indigo-100 rounded-full text-[10px] font-space font-black uppercase tracking-wider inline-block">
              Study Sync Engine
            </span>
            <h2 className="text-xl font-space font-black text-[#0A1128]">
              {authMode === 'signin' && 'Welcome Back, Scholar!'}
              {authMode === 'signup' && 'Create Your Mappy Profile'}
              {authMode === 'forgot' && 'Reset Secure Password'}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {authMode === 'signin' && 'Log in to securely backup and synchronize your study progress.'}
              {authMode === 'signup' && 'Join Mappy to track your syllabus and build consistent streaks.'}
              {authMode === 'forgot' && "Enter your email and we'll send you a password recovery link."}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-semibold leading-relaxed">
              ⚠️ {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-semibold leading-relaxed">
              ✅ {successMessage}
            </div>
          )}

          {/* Social Sign In (Hassle-Free Google Auth) */}
          {authMode !== 'forgot' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="w-full py-2.5 px-4 bg-white border border-stone-200 hover:border-stone-300 shadow-xs rounded-xl cursor-pointer transition flex items-center justify-center gap-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.67 14.94 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.86 3C6.27 7.5 8.9 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-1.99 3.42-4.92 3.42-8.56z" />
                  <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3l-3.86-3C.53 8.71 0 10.29 0 12s.53 3.29 1.5 4.8l3.86-3z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.96-1.07 7.95-2.91l-3.69-2.87c-1.02.68-2.33 1.09-3.96 1.09-3.1 0-5.73-2.46-6.64-5.46l-3.86 3C3.39 20.35 7.35 23 12 23z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px bg-stone-100 flex-1"></div>
                <span className="text-[9px] font-space font-black text-stone-400 uppercase tracking-widest">Or secure email</span>
                <div className="h-px bg-stone-100 flex-1"></div>
              </div>
            </div>
          )}

          {/* Core Auth Forms */}
          {authMode === 'signin' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-space font-extrabold text-stone-500 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.com"
                    className="w-full text-xs text-[#0A1128] bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-space font-extrabold text-stone-500 uppercase tracking-wider block">Password</label>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot')}
                    className="text-[10px] font-bold text-[#6366F1] hover:underline cursor-pointer border-none bg-transparent"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs text-[#0A1128] bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#6366F1] hover:bg-indigo-600 text-white text-xs font-space font-extrabold uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          )}

          {authMode === 'signup' && (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-space font-extrabold text-stone-500 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full text-xs text-[#0A1128] bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-space font-extrabold text-stone-500 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.com"
                    className="w-full text-xs text-[#0A1128] bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-space font-extrabold text-stone-500 uppercase tracking-wider block">Create Secure Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full text-xs text-[#0A1128] bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-space font-extrabold uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Profile
                  </>
                )}
              </button>
            </form>
          )}

          {authMode === 'forgot' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-space font-extrabold text-stone-500 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.com"
                    className="w-full text-xs text-[#0A1128] bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-space font-extrabold uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Send Reset Link
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode('signin')}
                className="w-full py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-bold rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 border-none"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </button>
            </form>
          )}

          {/* View Toggles */}
          {authMode !== 'forgot' && (
            <div className="text-center pt-2 border-t border-stone-100">
              {authMode === 'signin' ? (
                <p className="text-xs text-stone-500">
                  New to Mappy?{' '}
                  <button
                    onClick={() => handleSwitchMode('signup')}
                    className="font-bold text-[#6366F1] hover:underline cursor-pointer border-none bg-transparent"
                  >
                    Create an Account
                  </button>
                </p>
              ) : (
                <p className="text-xs text-stone-500">
                  Already have an account?{' '}
                  <button
                    onClick={() => handleSwitchMode('signin')}
                    className="font-bold text-[#6366F1] hover:underline cursor-pointer border-none bg-transparent"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
