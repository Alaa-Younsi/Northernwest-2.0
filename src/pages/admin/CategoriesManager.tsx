import { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useAdminCategories } from '@/hooks/useAdmin';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import type { Category } from '@/types';

interface CategoryFormData {
  name_en: string;
  name_ar: string;
  slug: string;
  description_en?: string;
  description_ar?: string;
  sort_order: number;
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function CategoryFormModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial?: Category | null;
  onSave: (data: CategoryFormData) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<CategoryFormData>({
    name_en: initial?.name_en ?? '',
    name_ar: initial?.name_ar ?? '',
    slug: initial?.slug ?? '',
    description_en: initial?.description_en ?? '',
    description_ar: initial?.description_ar ?? '',
    sort_order: initial?.sort_order ?? 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  const field = (label: string, key: keyof CategoryFormData, opts?: { type?: string; placeholder?: string }) => (
    <div>
      <label className="font-mono text-xs text-[#888888] uppercase tracking-widest block mb-1">{label}</label>
      <input
        type={opts?.type ?? 'text'}
        value={String(form[key] ?? '')}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: opts?.type === 'number' ? Number(e.target.value) : e.target.value }))}
        placeholder={opts?.placeholder ?? ''}
        className="bg-[#0d0d0d] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white placeholder-[#333] focus:border-[#FF0000] focus:outline-none w-full"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {field('Name (English)', 'name_en', { placeholder: 'e.g. Keyboards' })}
        {field('Name (Arabic)', 'name_ar', { placeholder: 'e.g. لوحات المفاتيح' })}
      </div>
      <div>
        <label className="font-mono text-xs text-[#888888] uppercase tracking-widest block mb-1">Slug</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="keyboards"
            className="bg-[#0d0d0d] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white placeholder-[#333] focus:border-[#FF0000] focus:outline-none flex-1"
          />
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, slug: slugify(form.name_en) }))}
            className="font-mono text-xs text-[#888888] border border-[#1a1a1a] px-3 hover:text-white hover:border-[#888888] transition-colors"
          >
            AUTO
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {field('Description (EN)', 'description_en', { placeholder: 'Optional' })}
        {field('Description (AR)', 'description_ar', { placeholder: 'اختياري' })}
      </div>
      {field('Sort Order', 'sort_order', { type: 'number' })}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="font-mono text-xs text-black bg-[#FF0000] px-6 py-2.5 hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {saving ? 'SAVING…' : initial ? 'UPDATE' : 'CREATE'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-xs text-[#888888] border border-[#1a1a1a] px-6 py-2.5 hover:text-white hover:border-[#888888] transition-colors"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}

export default function CategoriesManager() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useAdminCategories();
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (data: CategoryFormData) => {
    setSaving(true);
    try {
      await createCategory(data);
      toast.success('Category created');
      setShowCreate(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: CategoryFormData) => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await updateCategory(editTarget.id, data);
      toast.success('Category updated');
      setEditTarget(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete category "${cat.name_en}"?`)) return;
    try {
      await deleteCategory(cat.id);
      toast.success('Category deleted');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="font-display font-black text-white uppercase text-2xl sm:text-3xl tracking-widest border-l-2 border-[#FF0000] pl-4">
          CATEGORIES
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 font-mono text-xs text-black bg-[#FF0000] px-3 py-2 hover:bg-red-600 transition-colors whitespace-nowrap"
        >
          <Plus size={12} /> NEW CATEGORY
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#0d0d0d] border border-[#1a1a1a] p-6 h-36 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-[#FF0000] font-display font-black text-3xl mb-2">// NO CATEGORIES</div>
          <p className="font-mono text-xs text-[#444]">Create your first category to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-[#0d0d0d] border border-[#1a1a1a] p-6 group hover:border-[#FF0000]/50 transition-colors relative"
            >
              <div className="flex items-start justify-between mb-4">
                <Tag size={18} className="text-[#FF0000]" />
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditTarget(cat)}
                    className="text-[#888888] hover:text-white"
                    aria-label="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="text-[#888888] hover:text-[#FF0000]"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-display font-bold text-white uppercase tracking-wide mb-1">{cat.name_en}</h3>
              <p className="font-mono text-xs text-[#888888] mb-2" dir="rtl">{cat.name_ar}</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#FF0000] border border-[#FF0000]/30 px-2 py-0.5">/{cat.slug}</span>
                <span className="font-mono text-xs text-[#444]">#{cat.sort_order}</span>
              </div>
              {cat.description_en && (
                <p className="font-mono text-xs text-[#555] mt-3 line-clamp-2">{cat.description_en}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Category"
        size="lg"
      >
        <CategoryFormModal onSave={handleCreate} onClose={() => setShowCreate(false)} saving={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit: ${editTarget?.name_en ?? ''}`}
        size="lg"
      >
        {editTarget && (
          <CategoryFormModal
            initial={editTarget}
            onSave={handleUpdate}
            onClose={() => setEditTarget(null)}
            saving={saving}
          />
        )}
      </Modal>
    </div>
  );
}
