import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { PRODUCT_BRAND_NAME } from '@/app/config/branding';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas/authSchemas';
import { useAuthStore } from '@/store/authStore';
import styles from './AuthPages.module.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const registerAccount = useAuthStore((s) => s.register);
  const authError = useAuthStore((s) => s.error);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const pwValue = watch('password') || '';
  const pwStrength =
    pwValue.length >= 12
      ? 'Strong'
      : pwValue.length >= 8
      ? 'Acceptable'
      : pwValue.length > 0
      ? 'Weak'
      : '';

  const onSubmit = async (values: RegisterFormValues) => {
    const ok = await registerAccount({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
    });
    if (ok) {
      navigate(PATHS.AUTH.VERIFY_EMAIL);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>Create {PRODUCT_BRAND_NAME} account</h2>
        <p className={styles.subtitle}>
          Register your retail business to configure inventory, POS terminals, and staff roles.
        </p>
      </div>

      {authError && <div className={styles.bannerError}>{authError}</div>}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.fieldGroup}>
          <label htmlFor="reg-name" className={styles.label}>
            Full name
          </label>
          <input
            id="reg-name"
            type="text"
            className={styles.input}
            placeholder="e.g. Adebayo Ogunlesi"
            {...register('fullName')}
          />
          {errors.fullName && <span className={styles.errorText}>{errors.fullName.message}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="reg-email" className={styles.label}>
            Work or business email
          </label>
          <input
            id="reg-email"
            type="email"
            className={styles.input}
            placeholder="owner@yourstore.ng"
            {...register('email')}
          />
          {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <label htmlFor="reg-password" className={styles.label}>
              Password
            </label>
            {pwStrength && (
              <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                Strength: {pwStrength}
              </span>
            )}
          </div>
          <input
            id="reg-password"
            type="password"
            className={styles.input}
            placeholder="Minimum 8 characters"
            {...register('password')}
          />
          {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="reg-confirm" className={styles.label}>
            Confirm password
          </label>
          <input
            id="reg-confirm"
            type="password"
            className={styles.input}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <span className={styles.errorText}>{errors.confirmPassword.message}</span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" {...register('acceptTerms')} />
            <span>I agree to the {PRODUCT_BRAND_NAME} terms of service and data handling policy</span>
          </label>
          {errors.acceptTerms && (
            <span className={styles.errorText}>{errors.acceptTerms.message}</span>
          )}
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Continue to verification'}
        </Button>
      </form>

      <div className={styles.footerSwitch}>
        Already registered on {PRODUCT_BRAND_NAME}?{' '}
        <Link to={PATHS.AUTH.LOGIN} className={styles.link}>
          Sign in
        </Link>
      </div>
    </div>
  );
}
