import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import {
  onboardingSchema,
  type OnboardingFormValues,
} from '@/features/auth/schemas/authSchemas';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import styles from './AuthPages.module.css';

export function OnboardingPage() {
  const navigate = useNavigate();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: 'Oluwa & Sons Foodstuff Mart',
      businessType: 'Grocery & Foodstuff Retail',
      ownerName: 'Adebayo Ogunlesi',
      phone: '+234 803 482 9104',
      email: 'operations@oluwafoodmart.ng',
      address: '42 Daleko Market Road, Mushin, Lagos',
      currency: 'NGN',
      locale: 'en-NG',
    },
  });

  const values = watch();

  const onSubmit = async (formData: OnboardingFormValues) => {
    if (step === 1) {
      setStep(2);
      return;
    }
    const ok = await completeOnboarding(formData);
    if (ok) {
      await updateSettings({
        businessName: formData.businessName,
        businessType: formData.businessType,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        currency: formData.currency,
        locale: formData.locale,
      });
      navigate(PATHS.APP.DASHBOARD);
    }
  };

  return (
    <div>
      <div className={styles.stepBar} aria-label="Onboarding progress">
        <div className={`${styles.stepSegment} ${styles.stepSegmentActive}`} />
        <div
          className={`${styles.stepSegment} ${step === 2 ? styles.stepSegmentActive : ''}`}
        />
      </div>

      <div className={styles.pageHeader}>
        <h2 className={styles.title}>
          {step === 1 ? 'Configure your store profile' : 'Review store configuration'}
        </h2>
        <p className={styles.subtitle}>
          {step === 1
            ? 'Set your store name, Nigerian Naira (₦) defaults, and primary contact details.'
            : 'Confirm your business details before launching your POS & inventory workspace.'}
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {step === 1 ? (
          <>
            <div className={styles.fieldGroup}>
              <label htmlFor="onb-name" className={styles.label}>
                Business or store name
              </label>
              <input id="onb-name" className={styles.input} {...register('businessName')} />
              {errors.businessName && (
                <span className={styles.errorText}>{errors.businessName.message}</span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="onb-type" className={styles.label}>
                Business category
              </label>
              <select id="onb-type" className={styles.select} {...register('businessType')}>
                <option value="Grocery & Foodstuff Retail">Grocery & Foodstuff Retail</option>
                <option value="Wholesale Grains & Provisions">Wholesale Grains & Provisions</option>
                <option value="Coldroom & Frozen Foods">Coldroom & Frozen Foods</option>
                <option value="Supermarket & Mini-Mart">Supermarket & Mini-Mart</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="onb-owner" className={styles.label}>
                Owner / Administrator name
              </label>
              <input id="onb-owner" className={styles.input} {...register('ownerName')} />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="onb-phone" className={styles.label}>
                Store phone number
              </label>
              <input id="onb-phone" className={styles.input} {...register('phone')} />
              {errors.phone && <span className={styles.errorText}>{errors.phone.message}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="onb-address" className={styles.label}>
                Store address
              </label>
              <input id="onb-address" className={styles.input} {...register('address')} />
              {errors.address && <span className={styles.errorText}>{errors.address.message}</span>}
            </div>

            <Button type="submit" size="lg">
              Review configuration
            </Button>
          </>
        ) : (
          <>
            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-muted)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13px',
              }}
            >
              <div>
                <strong>Store Name:</strong> {values.businessName}
              </div>
              <div>
                <strong>Category:</strong> {values.businessType}
              </div>
              <div>
                <strong>Owner:</strong> {values.ownerName}
              </div>
              <div>
                <strong>Phone:</strong> {values.phone}
              </div>
              <div>
                <strong>Address:</strong> {values.address}
              </div>
              <div>
                <strong>Currency & Locale:</strong> {values.currency} ({values.locale})
              </div>
            </div>

            <div className={styles.rowBetween}>
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back to edit
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Launching...' : 'Complete setup & launch'}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
