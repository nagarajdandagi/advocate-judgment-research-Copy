"use client";

import React, { useState } from "react";
import { X, Lock, Mail, ShieldCheck, Scale, Check } from "lucide-react";
import { UserSession } from "@/lib/types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    const targetEmail = customEmail || email;
    const targetPassword = customPass || password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setError("Network error during login.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demEmail: string, demPass: string) => {
    setEmail(demEmail);
    setPassword(demPass);
    handleLogin(undefined, demEmail, demPass);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-amber-800 text-amber-100 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-serif">
                Advocate Research Authentication
              </h2>
              <p className="text-[11px] text-slate-500">
                Secure access to private research folders & notes
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Demo Fast-Login Accounts */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            One-Click Verified Demo Accounts:
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount("advocate@supremecourt.in", "Advocate@2026")}
              className="text-left p-2 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 text-xs transition-colors flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-slate-900">Advocate Rajesh Sharma</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Supreme Court & Karnataka HC &bull; KAR/1428/2008
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                Sign In
              </span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount("advocate.karnataka@law.in", "Advocate@2026")}
              className="text-left p-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-xs transition-colors flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-slate-900">Advocate Priyamvada Rao</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  High Court of Karnataka &bull; KAR/2891/2014
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                Sign In
              </span>
            </button>
          </div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleLogin} className="space-y-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
              Registered Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advocate@bar.in"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-600 font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              {loading ? "Authenticating..." : "Sign In to Research Session"}
            </button>
          </div>
        </form>

        <p className="text-[10px] text-slate-400 text-center">
          Encrypted sessions with HTTP-only cookies. No sensitive client data transmitted externally.
        </p>
      </div>
    </div>
  );
};
