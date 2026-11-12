'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { MAX_IMAGE_SIZE_MB } from '@/lib/constants';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { ActiveBadge, AdminPagination, AdminTitle, ConfirmDialog, EmptyRow, ErrorBox, FilterSelect, Modal, SearchBox, TableHead, TableWrap, fieldClass, td } from './admin-ui';
import type { CloudImage, Paginated } from '@/types';

interface Item {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  logo?: CloudImage;
  image?: CloudImage;
}

interface Config {
  endpoint: 'brands' | 'categories';
  title: string;
  singular: string;
  imageField: 'logo' | 'image';
  description: string;
}

export function TaxonomyManager({ config }: { config: Config }) {
  const { endpoint, title, singular, imageField } = config;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Item | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);

  const params = { page, limit: 20, ...(search && { search }), ...(status && { isActive: status }) };
  const listKey = ['admin-taxonomy', endpoint, params];

  const { data, isLoading, isError, error } = useQuery({
    queryKey: listKey,
    queryFn: async () => (await api.get<Paginated<Item>>(`/${endpoint}/admin`, { params })).data,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-taxonomy', endpoint] });
    queryClient.invalidateQueries({ queryKey: [endpoint === 'brands' ? 'admin-brand-options' : 'admin-category-options'] });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/${endpoint}/${id}`),
    onSuccess: () => {
      refresh();
      setDeleting(null);
      toast.success(`${singular} deleted`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div>
      <AdminTitle
        title={title}
        description={config.description}
        actions={<Button variant="gold" onClick={() => setEditing('new')}><Plus size={16} /> Add {singular.toLowerCase()}</Button>}
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={`Search ${title.toLowerCase()}...`} />
        <FilterSelect label="Visibility" value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: '', label: 'All' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Hidden' }]} />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorBox message={getErrorMessage(error)} />
      ) : (
        <>
          <TableWrap>
            <TableHead columns={[singular, 'Slug', 'Status', 'Created', '']} />
            <tbody className="divide-y divide-navy/10">
              {data?.data.length === 0 && <EmptyRow colSpan={5} message={`No ${title.toLowerCase()} yet`} />}
              {data?.data.map((item) => {
                const img = item[imageField];
                return (
                  <tr key={item._id} className="hover:bg-surface">
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden bg-navy font-serif text-gold">
                          {img ? <Image src={img.url} alt="" fill sizes="44px" className="bg-white object-contain" /> : item.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium">{item.name}</p>
                          {item.description && <p className="max-w-[260px] truncate text-xs text-navy/55">{item.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className={`${td} font-mono text-xs`}>{item.slug}</td>
                    <td className={td}><ActiveBadge active={item.isActive} /></td>
                    <td className={`${td} text-navy/60`}>{formatDate(item.createdAt)}</td>
                    <td className={td}>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setEditing(item)} className="inline-flex items-center gap-1 bg-navy px-3 py-1.5 text-xs font-semibold uppercase text-gold hover:bg-gold hover:text-navy"><Pencil size={12} /> Edit</button>
                        <button type="button" onClick={() => setDeleting(item)} aria-label="Delete" className="flex h-8 w-8 items-center justify-center text-navy/45 hover:text-error"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
          <AdminPagination meta={data?.meta} onPage={setPage} />
        </>
      )}

      <TaxonomyFormModal config={config} item={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null); }} />

      <ConfirmDialog
        open={!!deleting}
        title={`Delete ${singular.toLowerCase()}?`}
        message={<>“{deleting?.name}” will be deleted. If perfumes still use it, deletion is blocked — hide it instead.</>}
        confirmLabel="Delete"
        tone="danger"
        loading={deleteMutation.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
      />
    </div>
  );
}

function TaxonomyFormModal({ config, item, onClose, onSaved }: { config: Config; item: Item | 'new' | null; onClose: () => void; onSaved: () => void }) {
  const isNew = item === 'new';
  const existing = item && item !== 'new' ? item : null;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!item) return;
    setName(existing?.name ?? '');
    setDescription(existing?.description ?? '');
    setIsActive(existing?.isActive ?? true);
    setFile(null);
    setPreview(existing?.[config.imageField]?.url ?? null);
  }, [item]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickFile = (f?: File) => {
    if (!f) return;
    if (f.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) { toast.error(`Image must be under ${MAX_IMAGE_SIZE_MB}MB`); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    if (name.trim().length < 1) { toast.error('Name is required'); return; }
    const fd = new FormData();
    fd.append('name', name.trim());
    if (description.trim() || existing?.description) fd.append('description', description.trim());
    fd.append('isActive', String(isActive));
    if (file) fd.append(config.imageField, file);

    setSaving(true);
    try {
      if (isNew) await api.post(`/${config.endpoint}`, fd);
      else await api.patch(`/${config.endpoint}/${existing!._id}`, fd);
      toast.success(`${config.singular} ${isNew ? 'created' : 'updated'}`);
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title={isNew ? `Add ${config.singular.toLowerCase()}` : `Edit ${config.singular.toLowerCase()}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="gold" loading={saving} onClick={save}>{isNew ? 'Create' : 'Save'}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border-2 border-gold bg-surface">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-contain" />
            ) : (
              <ImagePlus size={24} className="text-gold-dark" />
            )}
          </div>
          <label className={cn('cursor-pointer border border-navy px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-navy hover:text-gold')}>
            {preview ? 'Change' : 'Upload'} {config.imageField}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
          </label>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={cn(fieldClass, 'h-11')} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">Description</label>
          <textarea rows={3} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} className={cn(fieldClass, 'py-2.5')} />
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-navy" />
          Visible in store
        </label>
      </div>
    </Modal>
  );
}