import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PATHS } from '../../../router/paths';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight text-center">
          Reset password
        </h2>
        <p className="text-xs text-slate-500 text-center mt-1">
          Enter your registered email address and we'll send you a password recovery link.
        </p>
      </div>

      {submitted ? (
        <div className="p-4 rounded-[var(--radius-card)] bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-semibold text-emerald-900">Recovery instructions simulated</h3>
          <p className="text-xs text-emerald-700">
            If an account exists for {email}, a recovery link has been simulated.
          </p>
          <Link to={PATHS.RESET_PASSWORD} className="inline-block text-xs font-semibold text-emerald-800 underline">
            Proceed to simulate Reset Password screen &rarr;
          </Link>
        </div>
      ) : (
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

          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
        </form>
      )}

      <div className="border-t border-slate-200 pt-4 text-center">
        <Link
          to={PATHS.LOGIN}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to login
        </Link>
      </div>
    </div>
  );
};

