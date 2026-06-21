import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { Mail, Lock, User as UserIcon, GraduationCap, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error("Full name is required to register catalog credentials.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters in length.");
        
        await registerWithEmail(email, password, name);
        setSuccessMsg("Registration successful! Authorized profile generated.");
        setTimeout(() => onSuccess(), 1500);
      } else {
        await loginWithEmail(email, password);
        setSuccessMsg("Access validated. Launching scholar portal...");
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError("Account not found. Please register a profile.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Invalid passport password associated with this email.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("An authorized profile with this email address already exists.");
      } else if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('auth/unauthorized-domain'))) {
        setError(
          `Firebase Auth Error: The domain '${window.location.hostname}' is not authorized. ` +
          "To fix this, go to your Firebase Console > Authentication > Settings > Authorized Domains, " +
          `and click 'Add domain' to whitelist '${window.location.hostname}'.`
        );
      } else {
        setError(err.message || 'Verification failed. Please review credit bounds or connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      setSuccessMsg("Access verified via Google security. Redirecting...");
      setTimeout(() => onSuccess(), 1000);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('auth/unauthorized-domain'))) {
        setError(
          `Firebase Auth Error: The domain '${window.location.hostname}' is not authorized. ` +
          "To fix this, go to your Firebase Console > Authentication > Settings > Authorized Domains, " +
          `and click 'Add domain' to whitelist '${window.location.hostname}'.`
        );
      } else {
        setError(err.message || "Google single sign-on was interrupted.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-portal" className="max-w-md mx-auto my-12 bg-white border border-navy/10 p-8 shadow-sm relative">
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gold" />
      
      {/* Header and Branding */}
      <div className="text-center mb-8">
        <div className="mx-auto w-12 h-12 bg-navy flex items-center justify-center text-gold mb-3">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-navy uppercase tracking-tight">
          {isRegister ? "Register Scholar Profile" : "Scholar Gate Access"}
        </h2>
        <p className="font-mono text-[10px] text-gold tracking-widest uppercase mt-1">
          Faculty Systems &bull; Unified Portal
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-l-2 border-red-500 text-xs text-red-700 mb-5 font-medium text-left">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border-l-2 border-emerald-500 text-xs text-emerald-700 mb-5 font-medium text-left animate-pulse">
          {successMsg}
        </div>
      )}

      {/* Main Authorize Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {isRegister && (
          <div>
            <label className="block font-mono text-[10px] uppercase text-navy/70 mb-1 font-bold">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-navy/40">
                <UserIcon className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jane Doe"
                className="w-full pl-10 pr-4 py-2 bg-[#fdfcf9] border border-navy/15 text-xs text-navy focus:outline-none focus:ring-1 focus:ring-gold"
                required={isRegister}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block font-mono text-[10px] uppercase text-navy/70 mb-1 font-bold">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-navy/40">
              <Mail className="h-4 w-4" />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="visitor@scholar.com"
              className="w-full pl-10 pr-4 py-2 bg-[#fdfcf9] border border-navy/15 text-xs text-navy focus:outline-none focus:ring-1 focus:ring-gold"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block font-mono text-[10px] uppercase text-navy/70 font-bold">
              Password
            </label>
            {!isRegister && (
              <span className="font-mono text-[9px] text-[#fdfcf9]/0 select-none">Forgot?</span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-3 text-navy/40">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
              className="w-full pl-10 pr-4 py-2 bg-[#fdfcf9] border border-navy/15 text-xs text-navy focus:outline-none focus:ring-1 focus:ring-gold"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full py-2.5 bg-navy text-[#fdfcf9] hover:bg-gold hover:text-navy font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition duration-300 disabled:opacity-50"
        >
          <span>{loading ? "Authorizing..." : (isRegister ? "Generate Account" : "Access Console")}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {/* Google Quick Sign on */}
      <div className="my-6 flex items-center justify-between">
        <span className="h-[1px] w-1/3 bg-navy/10" />
        <span className="font-mono text-[9px] uppercase text-navy/50 tracking-wider">Fast Access</span>
        <span className="h-[1px] w-1/3 bg-navy/10" />
      </div>

      <button
        onClick={handleGoogleAuth}
        disabled={loading}
        className="cursor-pointer w-full py-2 bg-white border border-navy/20 hover:border-navy text-navy font-mono text-[11px] font-semibold flex items-center justify-center gap-2 transition duration-300"
      >
        <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24">
          <path
            fill="#ea4335"
            d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 14.99 1 12 1 7.35 1 3.37 3.65 1.39 7.56l3.85 2.99c.9-2.7 3.4-4.51 6.76-4.51z"
          />
          <path
            fill="#4285f4"
            d="M23.45 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.42c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.37-4.87 3.37-8.25z"
          />
          <path
            fill="#fbbc05"
            d="M5.24 14.55c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.39 6.96C.5 8.76 0 10.77 0 12.9s.5 4.14 1.39 5.94l3.85-2.99s.24-.72.38-2.3z"
          />
          <path
            fill="#34a853"
            d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.12.75-2.54 1.25-4.3 1.25-3.36 0-5.86-1.81-6.76-4.51l-3.85 2.99C3.37 20.35 7.35 23 12 23z"
          />
        </svg>
        <span>Connect & Authenticate with Google</span>
      </button>

      {/* Switch modes link */}
      <div className="mt-8 pt-4 border-t border-navy/5 text-center">
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="font-mono text-[10px] uppercase text-gold hover:underline tracking-wider"
        >
          {isRegister ? "Already registered? Sign in" : "First time visiting? Register profile"}
        </button>
      </div>

      {/* Admin Notice */}
      <div className="mt-6 p-3 bg-navy/[0.02] border border-navy/5 text-[10px] text-navy/60 leading-normal flex items-start gap-2 text-left">
        <ShieldCheck className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-navy block uppercase font-mono text-[9px]">Standard Visitor Notice</span>
          By default, all fresh registrations hold standard scholar accesses. Enabling Email/Password login in the server’s Firebase Console establishes secure remote access instantly.
        </div>
      </div>
    </div>
  );
}
