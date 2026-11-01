import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { PRODUCT_BRAND_NAME } from '@/app/config/branding';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/authSchemas';
import { useAuthStore } from '@/store/authStore';
import styles from './AuthPages.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const authError = useAuthStore((s) => s.error);
  const status = useAuthStore((s) => s.status);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'adebayo@oluwafoodmart.ng',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const ok = await login({ email: values.email, password: values.password });
    if (ok) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === 'platform_admin') {
        navigate(PATHS.PLATFORM.DASHBOARD);
      } else if (currentUser?.role === 'super_business_admin') {
        navigate(PATHS.BUSINESS_ADMIN.OVERVIEW);
      } else if (currentUser?.role === 'cashier') {
        navigate(PATHS.APP.POS);
      } else {
        navigate(PATHS.APP.DASHBOARD);
      }
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>Sign in to Workspace</h2>
        <p className={styles.subtitle}>
          Enter your credentials to access your workspace.
        </p>
      </div>

      {authError && <div className={styles.bannerError}>{authError}</div>}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.fieldGroup}>
          <label htmlFor="login-email" className={styles.label}>
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            className={styles.input}
            placeholder="you@store.ng"
            {...register('email')}
          />
          {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <label htmlFor="login-password" className={styles.label}>
              Password
            </label>
            <Link to={PATHS.AUTH.FORGOT_PASSWORD} className={styles.link}>
              Forgot password?
            </Link>
          </div>
          <div className={styles.inputWrap}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className={styles.input}
              {...register('password')}
            />
            <button
              type="button"
              className={styles.togglePwBtn}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
        </div>

        <div className={styles.rowBetween}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" {...register('rememberMe')} />
            <span>Remember me</span>
          </label>
        </div>

        <Button type="submit" size="lg" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className={styles.footerSwitch}>
        New to {PRODUCT_BRAND_NAME}?{' '}
        <Link to={PATHS.AUTH.REGISTER} className={styles.link}>
          Create business account
        </Link>
      </div>
    </div>
  );
}
