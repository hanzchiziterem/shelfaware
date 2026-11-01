import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/features/auth/services/authApi';
import styles from './AuthPages.module.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('adebayo@oluwafoodmart.ng');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [error, setError] = useState('');

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Enter a valid staff email address.');
      return;
    }
    setError('');
    await authApi.requestPasswordReset(email);
    setStep('reset');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setStep('done');
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>
          {step === 'request'
            ? 'Password recovery'
            : step === 'reset'
              ? 'Set a new password'
              : 'Password updated'}
        </h2>
        <p className={styles.subtitle}>
          {step === 'request'
            ? 'Simulated recovery flow (no external email is dispatched in demo mode).'
            : step === 'reset'
              ? `Enter a new password for ${email}.`
              : 'Your demo password reset flow is complete.'}
        </p>
      </div>

      {error && <div className={styles.bannerError}>{error}</div>}

      {step === 'request' && (
        <form className={styles.form} onSubmit={handleRequest}>
          <div className={styles.fieldGroup}>
            <label htmlFor="fp-email" className={styles.label}>
              Staff email address
            </label>
            <input
              id="fp-email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg">
            Continue to reset form
          </Button>
        </form>
      )}

      {step === 'reset' && (
        <form className={styles.form} onSubmit={handleReset}>
          <div className={styles.fieldGroup}>
            <label htmlFor="fp-new" className={styles.label}>
              New password
            </label>
            <input
              id="fp-new"
              type="password"
              className={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="fp-confirm" className={styles.label}>
              Confirm new password
            </label>
            <input
              id="fp-confirm"
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg">
            Save new password
          </Button>
        </form>
      )}

      {step === 'done' && (
        <div className={styles.bannerSuccess}>
          Password recovery completed. Return to the sign-in screen to access your workspace.
        </div>
      )}

      <div className={styles.footerSwitch}>
        <Link to={PATHS.AUTH.LOGIN} className={styles.link}>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
