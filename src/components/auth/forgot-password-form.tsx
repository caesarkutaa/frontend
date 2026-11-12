'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
});
type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: Values) => {
    try {
      await api.post('/auth/forgot-password', { email });
      setSentTo(email);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not send reset link'));
    }
  };

  if (sentTo) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy text-gold">
          <MailCheck size={30} />
        </span>
        <h1 className="mt-6 text-3xl font-medium">Check your email</h1>
        <div className="mx-auto mt-3 h-0.5 w-12 bg-gold" />
        <p className="mt-4 text-sm leading-relaxed text-navy/65">
          If an account exists for <strong className="text-navy">{sentTo}</strong>, we’ve sent a link to reset your
          password. It expires in 30 minutes. Don’t forget to check your spam folder.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center bg-navy text-sm font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-navy"
          >
            Back to log in
          </Link>
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="text-xs font-semibold uppercase tracking-wider text-navy/60 underline underline-offset-4 hover:text-gold-dark"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-dark hover:text-navy">
        <ArrowLeft size={14} /> Back to log in
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">Account recovery</p>
      <h1 className="mt-2 text-3xl font-medium sm:text-4xl">Forgot password?</h1>
      <div className="mt-3 h-0.5 w-12 bg-gold" />
      <p className="mt-3 text-sm text-navy/60">
        Enter the email you signed up with and we’ll send you a link to choose a new password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Send reset link
        </Button>
      </form>
    </div>
  );
}