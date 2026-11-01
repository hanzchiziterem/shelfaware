import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import styles from './AuthPages.module.css';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const pendingEmail = useAuthStore((s) => s.pendingVerificationEmail);
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const authError = useAuthStore((s) => s.error);

  const [code, setCode] = useState('482910');
  const [resentMessage, setResentMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await verifyEmail(code);
    if (ok) {
      navigate(PATHS.AUTH.ONBOARDING);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>Verify your email</h2>
        <p className={styles.subtitle}>
          Simulated verification step for{' '}
          <strong>{pendingEmail || 'operations@oluwafoodmart.ng'}</strong>. Enter any 6-digit code
          to continue.
        </p>
      </div>

      {authError && <div className={styles.bannerError}>{authError}</div>}
      {resentMessage && <div className={styles.bannerSuccess}>{resentMessage}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label htmlFor="verify-code" className={styles.label}>
            6-digit verification code
          </label>
          <input
            id="verify-code"
            type="text"
            maxLength={6}
            className={styles.input}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
        </div>

        <Button type="submit" size="lg">
          Verify & proceed to store setup
        </Button>

        <div className={styles.rowBetween}>
          <button
            type="button"
            className={styles.link}
            onClick={() =>
              setResentMessage('Simulated new 6-digit verification code (482910) generated.')
            }
          >
            Resend code
          </button>
          <Link to={PATHS.AUTH.REGISTER} className={styles.link}>
            Change email address
          </Link>
        </div>
      </form>
    </div>
  );
}
