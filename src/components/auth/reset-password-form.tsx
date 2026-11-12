'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { CircleX, KeyRound } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';

const schema = z
  .object({
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
type Values = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const setGuest = useAuthStore((s) => s.setGuest);

  const validation = useQuery({
    queryKey: ['reset-token', token],
    enabled: /^[a-f0-9]{64}$/i.test(token),
    retry: false,
    queryFn: async () =>
      (await api.get<{ valid: boolean }>('/auth/reset-password/validate', { params: { token } })).data,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }: Values) => {
    try {
      const { data } = await api.post<{ message: string }>('/auth/reset-password', { token, password });
      setGuest(); // any old session in this browser is now signed out
      toast.success(data.message);
      router.replace('/login');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not reset password'));
    }
  };

  const tokenLooksValid = /^[a-f0-9]{64}$/i.test(token);

  if (tokenLooksValid && validation.isLoading) return <PageLoader label="Checking your link..." />;

  if (!tokenLooksValid || validation.isError || validation.data?.valid === false) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error">
          <CircleX size={30} />
        </span>
        <h1 className="mt-6 text-3xl font-medium">Link expired</h1>
        <div className="mx-auto mt-3 h-0.5 w-12 bg-gold" />
        <p className="mt-4 text-sm text-navy/65">
          This password reset link is invalid, has already been used, or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="mt-8 flex h-12 items-center justify-center bg-navy text-sm font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-navy"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div>
      <span className="flex h-12 w-12 items-center justify-center bg-navy text-gold">
        <KeyRound size={22} />
      </span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">Account recovery</p>
      <h1 className="mt-2 text-3xl font-medium sm:text-4xl">Choose a new password</h1>
      <div className="mt-3 h-0.5 w-12 bg-gold" />
      <p className="mt-3 text-sm text-navy/60">
        You’ll be signed out on all devices and can log in with your new password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        <PasswordInput
          label="New password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Use letters and numbers"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Reset password
        </Button>
      </form>
    </div>
  );
}