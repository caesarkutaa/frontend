'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { CONCENTRATION_LABELS, GENDER_LABELS, LONGEVITY_LABELS, SILLAGE_LABELS } from '@/lib/labels';
import { MAX_IMAGE_SIZE_MB } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { fieldClass } from './admin-ui';
import type { Brand, Category, Paginated, Perfume } from '@/types';

interface VariantField {
  _id?: string;
  size: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  sku: string;
}

interface FormValues {
  name: string;
  brand: string;
  category: string;
  description: string;
  shortDescription: string;
  gender: string;
  concentration: string;
  fragranceFamily: string;
  longevity: string;
  sillage: string;
  topNotes: string;
  middleNotes: string;
  baseNotes: string;
  isFeatured: boolean;
  isActive: boolean;
  variants: VariantField[];
}

const MAX_IMAGES = 10;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const emptyVariant: VariantField = { size: '', price: '', compareAtPrice: '', stock: '', sku: '' };

const toFormValues = (p?: Perfume): FormValues => ({
  name: p?.name ?? '',
  brand: p?.brand?._id ?? '',
  category: p?.category?._id ?? '',
  description: p?.description ?? '',
  shortDescription: p?.shortDescription ?? '',
  gender: p?.gender ?? 'unisex',
  concentration: p?.concentration ?? 'eau_de_parfum',
  fragranceFamily: p?.fragranceFamily ?? '',
  longevity: p?.longevity ?? '',
  sillage: p?.sillage ?? '',
  topNotes: p?.notes?.top.join(', ') ?? '',
  middleNotes: p?.notes?.middle.join(', ') ?? '',
  baseNotes: p?.notes?.base.join(', ') ?? '',
  isFeatured: p?.isFeatured ?? false,
  isActive: p?.isActive ?? true,
  variants: p?.variants.length
    ? p.variants.map((v) => ({
        _id: v._id,
        size: String(v.size),
        price: String(v.price),
        compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : '',
        stock: String(v.stock),
        sku: v.sku ?? '',
      }))
    : [{ ...emptyVariant }],
});

const splitNotes = (text: string) => text.split(',').map((n) => n.trim()).filter(Boolean);

function toPayload(v: FormValues) {
  return {
    name: v.name.trim(),
    brand: v.brand,
    category: v.category,
    description: v.description.trim(),
    ...(v.shortDescription.trim() && { shortDescription: v.shortDescription.trim() }),
    gender: v.gender,
    concentration: v.concentration,
    ...(v.fragranceFamily.trim() && { fragranceFamily: v.fragranceFamily.trim() }),
    ...(v.longevity && { longevity: v.longevity }),
    ...(v.sillage && { sillage: v.sillage }),
    notes: { top: splitNotes(v.topNotes), middle: splitNotes(v.middleNotes), base: splitNotes(v.baseNotes) },
    variants: v.variants.map((x) => ({
      ...(x._id && { _id: x._id }),
      size: Number(x.size),
      price: Number(x.price),
      ...(x.compareAtPrice && { compareAtPrice: Number(x.compareAtPrice) }),
      stock: Number(x.stock),
      ...(x.sku.trim() && { sku: x.sku.trim() }),
    })),
    isFeatured: v.isFeatured,
    isActive: v.isActive,
  };
}

function Field({ label, error, hint, children, className }: { label: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs text-error">{error}</p> : hint ? <p className="mt-1 text-xs text-navy/50">{hint}</p> : null}
    </div>
  );
}

const options = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>);

export function PerfumeForm({ mode, initial, onSaved }: { mode: 'create' | 'edit'; initial?: Perfume; onSaved: (perfume: Perfume) => void }) {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const brandsQuery = useQuery({ queryKey: ['admin-brand-options'], queryFn: async () => (await api.get<Paginated<Brand>>('/brands/admin', { params: { limit: 100 } })).data.data });
  const categoriesQuery = useQuery({ queryKey: ['admin-category-options'], queryFn: async () => (await api.get<Paginated<Category>>('/categories/admin', { params: { limit: 100 } })).data.data });

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ defaultValues: toFormValues(initial) });
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  useEffect(() => {
    if (initial) reset(toFormValues(initial));
  }, [initial, reset]);

  useEffect(() => () => images.forEach((i) => URL.revokeObjectURL(i.preview)), [images]);

  const addImages = (list: FileList | null) => {
    if (!list) return;
    const valid: { file: File; preview: string }[] = [];
    for (const file of Array.from(list)) {
      if (!IMAGE_TYPES.includes(file.type)) { toast.error(`${file.name}: unsupported format`); continue; }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) { toast.error(`${file.name}: larger than ${MAX_IMAGE_SIZE_MB}MB`); continue; }
      valid.push({ file, preview: URL.createObjectURL(file) });
    }
    setImages((prev) => [...prev, ...valid].slice(0, MAX_IMAGES));
  };

  const onSubmit = async (values: FormValues) => {
    if (mode === 'create' && images.length === 0) {
      toast.error('Add at least one image');
      return;
    }

    setSaving(true);
    try {
      const payload = toPayload(values);
      let saved: Perfume;

      if (mode === 'create') {
        const fd = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          fd.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        });
        images.forEach(({ file }) => fd.append('images', file));
        saved = (await api.post<Perfume>('/perfumes', fd)).data;
        toast.success('Perfume created — QR code generated');
      } else {
        saved = (await api.patch<Perfume>(`/perfumes/${initial!._id}`, payload)).data;
        toast.success('Perfume updated');
      }
      onSaved(saved);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save perfume'));
    } finally {
      setSaving(false);
    }
  };

  const select = (hasError?: boolean) => cn(fieldClass, 'h-11', hasError && 'border-error');
  const input = (hasError?: boolean) => cn(fieldClass, 'h-11', hasError && 'border-error');

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {/* Basics */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={errors.name?.message} className="sm:col-span-2">
          <input className={input(!!errors.name)} placeholder="e.g. Sauvage Elixir" {...register('name', { required: 'Name is required' })} />
        </Field>
        <Field label="Brand" error={errors.brand?.message}>
          <select className={select(!!errors.brand)} {...register('brand', { required: 'Select a brand' })}>
            <option value="">Select brand</option>
            {brandsQuery.data?.map((b) => <option key={b._id} value={b._id}>{b.name}{!b.isActive ? ' (hidden)' : ''}</option>)}
          </select>
        </Field>
        <Field label="Category / family" error={errors.category?.message}>
          <select className={select(!!errors.category)} {...register('category', { required: 'Select a category' })}>
            <option value="">Select category</option>
            {categoriesQuery.data?.map((c) => <option key={c._id} value={c._id}>{c.name}{!c.isActive ? ' (hidden)' : ''}</option>)}
          </select>
        </Field>
        <Field label="Gender"><select className={select()} {...register('gender')}>{options(GENDER_LABELS)}</select></Field>
        <Field label="Concentration"><select className={select()} {...register('concentration')}>{options(CONCENTRATION_LABELS)}</select></Field>
        <Field label="Fragrance type" hint="e.g. Aromatic Fougère"><input className={input()} {...register('fragranceFamily')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Longevity"><select className={select()} {...register('longevity')}><option value="">—</option>{options(LONGEVITY_LABELS)}</select></Field>
          <Field label="Sillage"><select className={select()} {...register('sillage')}><option value="">—</option>{options(SILLAGE_LABELS)}</select></Field>
        </div>
        <Field label="Short description" hint="Shown under the name (max 200)" className="sm:col-span-2">
          <input className={input()} maxLength={200} {...register('shortDescription')} />
        </Field>
        <Field label="Full description" error={errors.description?.message} className="sm:col-span-2">
          <textarea rows={6} className={cn(fieldClass, 'py-3', errors.description && 'border-error')} {...register('description', { required: 'Description is required' })} />
        </Field>
      </div>

      {/* Notes */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gold-dark">Fragrance notes <span className="font-normal normal-case text-navy/50">(comma separated)</span></h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Top notes"><input className={input()} placeholder="Bergamot, Pepper" {...register('topNotes')} /></Field>
          <Field label="Heart notes"><input className={input()} placeholder="Lavender, Geranium" {...register('middleNotes')} /></Field>
          <Field label="Base notes"><input className={input()} placeholder="Amber, Vanilla" {...register('baseNotes')} /></Field>
        </div>
      </div>

      {/* Variants */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold-dark">Sizes, prices & stock</h3>
          <button type="button" onClick={() => append({ ...emptyVariant })} disabled={fields.length >= 10} className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-navy hover:text-gold-dark disabled:opacity-40">
            <Plus size={14} /> Add size
          </button>
        </div>
        <div className="space-y-3">
          {fields.map((field, i) => {
            const e = errors.variants?.[i];
            return (
              <div key={field.id} className="grid grid-cols-2 gap-3 border border-navy/10 bg-surface p-3 sm:grid-cols-6 sm:items-end">
                <Field label="Size (ml)" error={e?.size?.message}>
                  <input type="number" inputMode="numeric" className={input(!!e?.size)} {...register(`variants.${i}.size`, { required: 'Required', validate: (v) => Number(v) >= 1 || 'Min 1' })} />
                </Field>
                <Field label="Price (₦)" error={e?.price?.message}>
                  <input type="number" inputMode="numeric" className={input(!!e?.price)} {...register(`variants.${i}.price`, { required: 'Required', validate: (v) => Number(v) >= 0 || 'Invalid' })} />
                </Field>
                <Field label="Old price" error={e?.compareAtPrice?.message}>
                  <input type="number" inputMode="numeric" className={input()} placeholder="Optional" {...register(`variants.${i}.compareAtPrice`)} />
                </Field>
                <Field label="Stock" error={e?.stock?.message}>
                  <input type="number" inputMode="numeric" className={input(!!e?.stock)} {...register(`variants.${i}.stock`, { required: 'Required', validate: (v) => (Number.isInteger(Number(v)) && Number(v) >= 0) || 'Whole number' })} />
                </Field>
                <Field label="SKU">
                  <input className={input()} placeholder="Auto" {...register(`variants.${i}.sku`)} />
                </Field>
                <button type="button" onClick={() => remove(i)} disabled={fields.length === 1} aria-label="Remove size" className="flex h-11 items-center justify-center gap-1 border border-error/40 text-xs font-semibold uppercase text-error hover:bg-error hover:text-white disabled:opacity-30">
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            );
          })}
        </div>
        {mode === 'edit' && <p className="mt-2 text-xs text-navy/50">Existing sizes keep their ID so customers’ carts stay valid.</p>}
      </div>

      {/* Images (create only — edit page has its own manager) */}
      {mode === 'create' && (
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gold-dark">Images <span className="font-normal normal-case text-navy/50">(first = cover, max {MAX_IMAGES})</span></h3>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {images.map((img, i) => (
              <div key={img.preview} className={cn('relative aspect-square overflow-hidden border-2 bg-surface', i === 0 ? 'border-gold' : 'border-navy/10')}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.preview} alt="" className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 bg-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-navy">Cover</span>}
                <button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} aria-label="Remove image" className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center bg-navy text-gold hover:bg-error hover:text-white">
                  <X size={14} />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed border-gold text-center text-xs font-semibold text-navy hover:bg-gold/10">
                <ImagePlus size={22} className="text-gold-dark" />
                Add images
                <input type="file" multiple accept={IMAGE_TYPES.join(',')} className="sr-only" onChange={(e) => { addImages(e.target.files); e.target.value = ''; }} />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Flags */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
        <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-navy" {...register('isActive')} /> Visible in store</label>
        <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-navy" {...register('isFeatured')} /> Featured</label>
      </div>

      <div className="flex flex-col gap-2 border-t border-navy/10 pt-6 xs:flex-row">
        <Button type="submit" variant="gold" size="lg" loading={saving}>
          {mode === 'create' ? 'Create perfume & QR code' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}