'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input, PasswordInput } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/api';
import { safeRedirect } from '@/lib/utils';

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    phone: z
      .string()
      .trim()
      .max(20, 'Phone number is too long')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(64)
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Use at least one letter and one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registerUser = useAuthStore((s) => s.register);
  const redirect = searchParams.get('redirect');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async ({ confirmPassword: _confirm, phone, ...values }: RegisterValues) => {
    try {
      const user = await registerUser({ ...values, ...(phone ? { phone } : {}) });
      toast.success(`Welcome, ${user.name.split(' ')[0]}! Your account is ready.`);
      router.replace(safeRedirect(redirect, '/'));
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Registration failed'));
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">Join us</p>
      <h1 className="mt-2 text-3xl font-medium sm:text-4xl">Create account</h1>
      <div className="mt-3 h-0.5 w-12 bg-gold" />
      <p className="mt-3 text-sm text-navy/60">Track orders and check out faster next time.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        <Input
          label="Full name"
          autoComplete="name"
          placeholder="Your full name"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone (optional)"
            type="tel"
            autoComplete="tel"
            placeholder="080..."
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <PasswordInput
          label="Password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Use letters and numbers"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-navy/60">
        Already have an account?{' '}
        <Link
          href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-dark"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}