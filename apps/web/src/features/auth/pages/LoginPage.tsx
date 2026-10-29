import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PATHS } from '../../../router/paths';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, status, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('adeola@adeolafoods.ng');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await login({ email, password, rememberMe });
    if (success) {
      navigate(PATHS.POS);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight text-center">
          Sign in
        </h2>
        <p className="text-xs text-slate-500 text-center mt-1">
          Enter your credentials
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-[var(--radius-control)] bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@business.com"
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Remember me
          </label>
          <Link
            to={PATHS.FORGOT_PASSWORD}
            className="font-medium text-emerald-600 hover:text-emerald-500"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={status === 'loading'}
        >
          Sign In
        </Button>
      </form>

      <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-600">
        New store or business?{' '}
        <Link to={PATHS.SIGNUP} className="font-semibold text-emerald-600 hover:text-emerald-500">
          Create business account
        </Link>
      </div>
    </div>
  );
};

