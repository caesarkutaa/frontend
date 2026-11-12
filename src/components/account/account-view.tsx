'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { CircleX, KeyRound, MapPin, UserRound } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { NIGERIAN_STATES } from '@/lib/constants';
import { cn, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { Button, buttonClasses } from '@/components/ui/button';
import { Input, PasswordInput } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { PageLoader } from '@/components/ui/spinner';
import { StateMessage } from '@/components/ui/state-message';
import type { User } from '@/types';

const PROFILE_KEY = ['me-profile'];

function Card({ icon: Icon, title, children, className }: { icon: typeof UserRound; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('border-t-4 border-gold bg-surface p-5 sm:p-6', className)}>
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center bg-navy text-gold">
          <Icon size={18} />
        </span>
        <h2 className="text-xl font-medium sm:text-2xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/* ---------------- Profile ---------------- */
const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  phone: z.string().trim().max(20, 'Phone number is too long').optional().or(z.literal('')),
});
type ProfileValues = z.infer<typeof profileSchema>;

function ProfileCard({ profile }: { profile: User }) {
  const queryClient = useQueryClient();
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile.name, phone: profile.phone ?? '' },
  });

  useEffect(() => reset({ name: profile.name, phone: profile.phone ?? '' }), [profile, reset]);

  const mutation = useMutation({
    mutationFn: async (values: ProfileValues) =>
      (await api.patch<User>('/users/me', { name: values.name, ...(values.phone ? { phone: values.phone } : {}) })).data,
    onSuccess: (user) => {
      queryClient.setQueryData(PROFILE_KEY, user);
      fetchMe(); // refresh name in the navbar
      toast.success('Profile updated');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not update profile')),
  });

  return (
    <Card icon={UserRound} title="Profile">
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate className="space-y-5">
        <Input label="Full name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" value={profile.email} disabled hint="Email can’t be changed" className="cursor-not-allowed opacity-70" />
        <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
        <p className="text-xs text-navy/50">Member since {formatDate(profile.createdAt)}</p>
        <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>
          Save profile
        </Button>
      </form>
    </Card>
  );
}

/* ---------------- Address ---------------- */
const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter the recipient’s full name').max(80),
  phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{9,15}$/, 'Enter a valid phone number'),
  street: z.string().trim().min(5, 'Enter a full street address').max(200),
  city: z.string().trim().min(2, 'Enter a city or town').max(60),
  state: z.string().trim().min(2, 'Select a state'),
  country: z.string().trim().min(2).max(60),
});
type AddressValues = z.infer<typeof addressSchema>;

function AddressCard({ profile }: { profile: User }) {
  const queryClient = useQueryClient();
  const toValues = (p: User): AddressValues => ({
    fullName: p.address?.fullName ?? p.name,
    phone: p.address?.phone ?? p.phone ?? '',
    street: p.address?.street ?? '',
    city: p.address?.city ?? '',
    state: p.address?.state ?? '',
    country: p.address?.country ?? 'Nigeria',
  });

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: toValues(profile),
  });

  useEffect(() => reset(toValues(profile)), [profile, reset]);

  const mutation = useMutation({
    mutationFn: async (address: AddressValues) => (await api.patch<User>('/users/me', { address })).data,
    onSuccess: (user) => {
      queryClient.setQueryData(PROFILE_KEY, user);
      toast.success('Delivery address saved');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not save address')),
  });

  return (
    <Card icon={MapPin} title="Delivery address">
      {!profile.address && (
        <p className="mb-5 border-l-4 border-gold bg-gold/15 p-3 text-sm">
          Save an address to check out faster next time.
        </p>
      )}
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate className="grid gap-5 sm:grid-cols-2">
        <Input label="Full name" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Phone number" type="tel" error={errors.phone?.message} {...register('phone')} />
        <div className="sm:col-span-2">
          <Input label="Street address" placeholder="House number, street, landmark" error={errors.street?.message} {...register('street')} />
        </div>
        <Input label="City / Town" error={errors.city?.message} {...register('city')} />
        <div>
          <label htmlFor="account-state" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">
            State
          </label>
          <select
            id="account-state"
            {...register('state')}
            className={cn('h-11 w-full border bg-white px-3 text-sm outline-none focus:border-gold', errors.state ? 'border-error' : 'border-navy/20')}
          >
            <option value="">Select state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <p className="mt-1.5 text-xs text-error">{errors.state.message}</p>}
        </div>
        <Input label="Country" error={errors.country?.message} {...register('country')} />
        <div className="flex items-end sm:col-span-2">
          <Button type="submit" loading={mutation.isPending} disabled={!isDirty && !!profile.address}>
            Save address
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* ---------------- Password ---------------- */
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .max(64)
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Use at least one letter and one number'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });
type PasswordValues = z.infer<typeof passwordSchema>;

function PasswordCard() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const mutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: PasswordValues) =>
      api.patch('/users/me/password', { currentPassword, newPassword }),
    onSuccess: () => {
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not change password')),
  });

  return (
    <Card icon={KeyRound} title="Change password">
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate className="space-y-5">
        <PasswordInput label="Current password" autoComplete="current-password" error={errors.currentPassword?.message} {...register('currentPassword')} />
        <PasswordInput label="New password" autoComplete="new-password" hint="Use letters and numbers" error={errors.newPassword?.message} {...register('newPassword')} />
        <PasswordInput label="Confirm new password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" variant="gold" loading={mutation.isPending}>
          Update password
        </Button>
      </form>
    </Card>
  );
}

/* ---------------- Page ---------------- */
export function AccountView() {
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => (await api.get<User>('/users/me')).data,
  });

  if (isLoading) return <PageLoader label="Loading your account..." />;
  if (isError || !profile) {
    return <StateMessage icon={CircleX} tone="error" title="Could not load your account" description={getErrorMessage(error)} />;
  }

  return (
    <div className="pb-16 sm:pb-24">
      <PageHeader eyebrow="My account" title={`Hello, ${profile.name.split(' ')[0]}`} description={profile.email}>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/orders" className={buttonClasses({ variant: 'gold', size: 'sm' })}>My orders</Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className={buttonClasses({ size: 'sm', className: 'border border-gold' })}>Admin panel</Link>
          )}
        </div>
      </PageHeader>

      <div className="container-page grid gap-6 pt-8 sm:pt-10 lg:grid-cols-2">
        <ProfileCard profile={profile} />
        <PasswordCard />
        <AddressCard profile={profile} />
      </div>
    </div>
  );
}