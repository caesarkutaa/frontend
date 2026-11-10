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

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const redirect = searchParams.get('redirect');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);

      const fallback = user.role === 'admin' ? '/admin' : '/';
      router.replace(safeRedirect(redirect, fallback));
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Login failed'));
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">
        Welcome back
      </p>
      <h1 className="mt-2 text-3xl font-medium sm:text-4xl">Log in</h1>
      <div className="mt-3 h-0.5 w-12 bg-gold" />
      <p className="mt-3 text-sm text-navy/60">
        Access your orders, saved address and faster checkout.
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
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Log in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-navy/60">
        New here?{' '}
        <Link
          href={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-dark"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}