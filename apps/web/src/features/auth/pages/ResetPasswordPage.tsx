import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PATHS } from '../../../router/paths';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setSuccess(true);
    setTimeout(() => {
      navigate(PATHS.LOGIN);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight text-center">
          Set new password
        </h2>
        <p className="text-xs text-slate-500 text-center mt-1">
          Create a strong password for your staff login.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-[var(--radius-control)] bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-4 rounded-[var(--radius-card)] bg-emerald-50 border border-emerald-200 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-semibold text-emerald-900">Password reset successful</h3>
          <p className="text-xs text-emerald-700">Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Input
            label="Confirm New Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button type="submit" className="w-full">
            Update Password
          </Button>
        </form>
      )}

      <div className="border-t border-slate-200 pt-4 text-center">
        <Link to={PATHS.LOGIN} className="text-xs text-slate-600 hover:text-slate-900 font-medium">
          Return to login
        </Link>
      </div>
    </div>
  );
};

