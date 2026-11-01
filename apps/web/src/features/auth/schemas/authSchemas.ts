import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid work email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: 'You must accept the terms of service',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const onboardingSchema = z.object({
  businessName: z.string().min(2, 'Business or store name is required'),
  businessType: z.string().min(2, 'Select a business category'),
  ownerName: z.string().min(2, 'Owner or administrator name is required'),
  phone: z.string().min(8, 'Enter a valid Nigerian phone number'),
  email: z.string().email('Enter a valid business email'),
  address: z.string().min(5, 'Store address is required'),
  currency: z.string().min(3),
  locale: z.string().min(2),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
