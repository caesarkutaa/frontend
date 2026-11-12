'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CircleCheck, Download, ExternalLink, ImagePlus, Printer, RefreshCw, Star, Trash2 } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { MAX_IMAGE_SIZE_MB } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button, buttonClasses } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { PageLoader } from '@/components/ui/spinner';
import { AdminTitle, ConfirmDialog, ErrorBox, Panel } from './admin-ui';
import { PerfumeForm } from './perfume-form';
import type { Perfume } from '@/types';

/** Opens a print-ready page with just the QR (sized for a bottle sticker) */
function printQr(url: string, name: string) {
  const win = window.open('', '_blank', 'width=480,height=640');
  if (!win) {
    toast.error('Allow pop-ups to print the QR code');
    return;
  }
  const doc = win.document;
  doc.title = `QR – ${name}`;
  doc.body.style.cssText = 'margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif';
  const img = doc.createElement('img');
  img.src = url;
  img.style.width = '50mm';
  const label = doc.createElement('p');
  label.textContent = name;
  label.style.cssText = 'font-size:10pt;margin-top:4mm';
  img.onload = () => {
    win.focus();
    win.print();
  };
  doc.body.append(img, label);
}

export function PerfumeEditor({ perfumeId, justCreated = false }: { perfumeId: string; justCreated?: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const key = ['admin-perfume', perfumeId];
  const [confirm, setConfirm] = useState<null | 'delete' | 'regenerate' | { removeImage: string }>(null);

  const { data: perfume, isLoading, isError, error } = useQuery({
    queryKey: key,
    queryFn: async () => (await api.get<Perfume>(`/perfumes/admin/${perfumeId}`)).data,
  });

  const setPerfume = (p: Perfume) => {
    queryClient.setQueryData(key, p);
    queryClient.invalidateQueries({ queryKey: ['admin-perfumes'] });
  };

  const imagesMutation = useMutation({
    mutationFn: async (action: { type: 'add'; files: File[] } | { type: 'remove'; publicId: string } | { type: 'cover'; publicId: string }) => {
      if (action.type === 'add') {
        const fd = new FormData();
        action.files.forEach((f) => fd.append('images', f));
        return (await api.post<Perfume>(`/perfumes/${perfumeId}/images`, fd)).data;
      }
      if (action.type === 'remove') {
        return (await api.delete<Perfume>(`/perfumes/${perfumeId}/images`, { params: { publicId: action.publicId } })).data;
      }
      const ids = perfume!.images.map((i) => i.publicId);
      const ordered = [action.publicId, ...ids.filter((id) => id !== action.publicId)];
      return (await api.patch<Perfume>(`/perfumes/${perfumeId}/images/reorder`, { publicIds: ordered })).data;
    },
    onSuccess: (p) => {
      setPerfume(p);
      setConfirm(null);
      toast.success('Images updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => api.post(`/perfumes/${perfumeId}/qr-code/regenerate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      setConfirm(null);
      toast.success('QR code regenerated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => api.delete(`/perfumes/${perfumeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-perfumes'] });
      toast.success('Perfume deleted');
      router.replace('/admin/perfumes');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <PageLoader label="Loading perfume..." />;
  if (isError || !perfume) return <ErrorBox message={getErrorMessage(error, 'Perfume not found')} />;

  const uploadFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const files = Array.from(list).filter((f) => f.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024);
    if (files.length < list.length) toast.error(`Some files were over ${MAX_IMAGE_SIZE_MB}MB and skipped`);
    if (files.length) imagesMutation.mutate({ type: 'add', files });
  };

  return (
    <div className="space-y-6">
      <AdminTitle
        title={perfume.name}
        description={<span>{perfume.brand?.name} · <span className="font-mono text-xs">/{perfume.slug}</span></span>}
        actions={
          <>
            <Link href="/admin/perfumes" className={buttonClasses({ variant: 'outline', size: 'sm' })}>All perfumes</Link>
            <a href={`/perfumes/${perfume.slug}`} target="_blank" rel="noopener noreferrer" className={buttonClasses({ size: 'sm' })}>
              <ExternalLink size={14} /> View on site
            </a>
          </>
        }
      />

      {justCreated && (
        <div className="flex items-start gap-3 border-l-4 border-success bg-success/10 p-4 text-sm">
          <CircleCheck size={18} className="mt-0.5 shrink-0 text-success" />
          <p><span className="font-semibold">Perfume created and QR code generated.</span> Download or print it below and stick it on the bottle.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel title="Details" className="order-2 lg:order-1">
          <PerfumeForm mode="edit" initial={perfume} onSaved={setPerfume} />
        </Panel>

        <div className="order-1 space-y-6 lg:order-2">
          {/* QR code */}
          <section className="border-t-4 border-gold bg-navy p-5 text-white">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gold">Bottle QR code</h2>
            {perfume.qrCode?.url ? (
              <>
                <div className="mx-auto mt-4 w-full max-w-[220px] bg-white p-3">
                  <Image src={perfume.qrCode.url} alt={`QR code for ${perfume.name}`} width={400} height={400} className="h-auto w-full" />
                </div>
                <p className="mt-3 text-xs text-white/65">Scans to:</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate font-mono text-xs text-gold-light">{perfume.qrLink}</p>
                  <CopyButton value={perfume.qrLink ?? ''} label="Copy" className="h-8 bg-gold px-2 text-navy hover:bg-gold-light" />
                </div>
                {perfume.qrLink?.includes('localhost') && (
                  <p className="mt-2 bg-error p-2 text-xs text-white">This QR points to localhost and won’t open on phones. Set FRONTEND_URL to your real domain, then regenerate.</p>
                )}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {perfume.qrDownloadUrl && (
                    <a href={perfume.qrDownloadUrl} className={buttonClasses({ variant: 'gold', size: 'sm' })}><Download size={14} /> PNG</a>
                  )}
                  <a href={`/api/perfumes/${perfume._id}/qr-code/svg`} className={buttonClasses({ variant: 'gold', size: 'sm' })}><Download size={14} /> SVG</a>
                  <button type="button" onClick={() => printQr(perfume.qrCode!.url, perfume.name)} className={buttonClasses({ size: 'sm', className: 'border border-gold' })}><Printer size={14} /> Print</button>
                  <button type="button" onClick={() => setConfirm('regenerate')} className={buttonClasses({ size: 'sm', className: 'border border-gold' })}><RefreshCw size={14} /> Regenerate</button>
                </div>
              </>
            ) : (
              <Button variant="gold" className="mt-4" fullWidth onClick={() => setConfirm('regenerate')}>Generate QR code</Button>
            )}
          </section>

          {/* Images */}
          <Panel title={`Images (${perfume.images.length})`}>
            <div className="grid grid-cols-3 gap-2">
              {perfume.images.map((img, i) => (
                <div key={img.publicId} className={cn('group relative aspect-square overflow-hidden border-2 bg-surface', i === 0 ? 'border-gold' : 'border-navy/10')}>
                  <Image src={img.url} alt="" fill sizes="110px" className="object-cover" />
                  {i === 0 && <span className="absolute left-1 top-1 bg-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-navy">Cover</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-navy/80 p-1">
                    {i !== 0 && (
                      <button type="button" disabled={imagesMutation.isPending} onClick={() => imagesMutation.mutate({ type: 'cover', publicId: img.publicId })} aria-label="Make cover" className="flex h-7 w-7 items-center justify-center text-gold hover:bg-gold hover:text-navy"><Star size={14} /></button>
                    )}
                    <button type="button" disabled={imagesMutation.isPending || perfume.images.length <= 1} onClick={() => setConfirm({ removeImage: img.publicId })} aria-label="Delete image" className="flex h-7 w-7 items-center justify-center text-white hover:bg-error disabled:opacity-30"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {perfume.images.length < 10 && (
                <label className={cn('flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed border-gold text-center text-[11px] font-semibold hover:bg-gold/10', imagesMutation.isPending && 'pointer-events-none opacity-50')}>
                  <ImagePlus size={20} className="text-gold-dark" />
                  {imagesMutation.isPending ? 'Uploading…' : 'Add'}
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => { uploadFiles(e.target.files); e.target.value = ''; }} />
                </label>
              )}
            </div>
          </Panel>

          {/* Danger zone */}
          <section className="border border-error/40 bg-error/5 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-error">Danger zone</h2>
            <p className="mt-2 text-xs text-navy/65">Deleting removes the perfume, its images and QR code. Printed stickers will show “not available”. Consider hiding it instead.</p>
            <Button variant="danger" size="sm" className="mt-4" onClick={() => setConfirm('delete')}><Trash2 size={14} /> Delete perfume</Button>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirm === 'delete'}
        title="Delete perfume?"
        message={`“${perfume.name}” will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        loading={deleteMutation.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => deleteMutation.mutate()}
      />
      <ConfirmDialog
        open={confirm === 'regenerate'}
        title="Regenerate QR code?"
        message="Use this after changing your website domain. Already-printed stickers keep working only if the domain is the same."
        confirmLabel="Regenerate"
        tone="gold"
        loading={regenerateMutation.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => regenerateMutation.mutate()}
      />
      <ConfirmDialog
        open={!!confirm && typeof confirm === 'object'}
        title="Delete image?"
        message="This image will be removed from the perfume."
        confirmLabel="Delete image"
        tone="danger"
        loading={imagesMutation.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && typeof confirm === 'object' && imagesMutation.mutate({ type: 'remove', publicId: confirm.removeImage })}
      />
    </div>
  );
}