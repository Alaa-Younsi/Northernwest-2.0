import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import type { Product } from '@/types';
import ProductForm from './ProductForm';

export default function ProductsManager() {
  const { t } = useTranslation();
  const { products, loading, deleteProduct, createProduct, updateProduct } = useAdmin();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = products.filter(
    (p) =>
      p.name_en.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name_en ?? '').toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      toast.success('Product deleted');
    } catch {
      toast.error('Delete failed');
    }
    setDeleteTarget(null);
  };

  const handleSave = async (data: unknown) => {
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, data);
        toast.success('Product updated');
      } else {
        await createProduct(data);
        toast.success('Product created');
      }
      setFormOpen(false);
      setEditProduct(null);
    } catch {
      toast.error('Save failed');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-black text-white uppercase text-3xl tracking-widest">
          {t('admin.products')}
        </h1>
        <Button
          variant="primary"
          onClick={() => { setEditProduct(null); setFormOpen(true); }}
          className="flex items-center gap-2"
        >
          <Plus size={14} />
          {t('admin.addProduct')}
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.search')}
          className="bg-[#0d0d0d] border border-[#1a1a1a] px-4 py-2.5 font-mono text-sm text-white placeholder-[#333] focus:border-[#FF0000] focus:outline-none w-full max-w-xs"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              {[t('admin.image'), t('admin.name'), t('admin.category'), t('admin.price'), t('admin.stock'), t('admin.status'), t('admin.actions')].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-[#888888] uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#888888]">
                  {t('common.loading')}
                </td>
              </tr>
            ) : paginated.map((product) => (
              <tr key={product.id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors">
                <td className="px-4 py-3">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.name_en} className="w-10 h-10 object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-[#111] flex items-center justify-center text-[#333] text-xs font-display">NW</div>
                  )}
                </td>
                <td className="px-4 py-3 text-white font-bold">{product.name_en}</td>
                <td className="px-4 py-3 text-[#888888]">{product.category?.name_en ?? '—'}</td>
                <td className="px-4 py-3 text-[#FF0000]">${product.base_price.toFixed(2)}</td>
                <td className="px-4 py-3 text-[#888888]">
                  {product.variants
                    ? product.variants.reduce((s, v) => s + v.stock, 0)
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={product.is_active ? 'green' : 'gray'}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditProduct(product); setFormOpen(true); }}
                      className="text-[#888888] hover:text-white transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="text-[#888888] hover:text-[#FF0000] transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#888888]">
                  {t('common.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 font-mono text-xs ${
                page === i + 1
                  ? 'bg-[#FF0000] text-black'
                  : 'border border-[#1a1a1a] text-[#888888] hover:border-[#FF0000]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditProduct(null); }}
        title={editProduct ? t('admin.editProduct') : t('admin.addProduct')}
        size="xl"
      >
        <ProductForm
          product={editProduct}
          onSave={handleSave}
          onCancel={() => { setFormOpen(false); setEditProduct(null); }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('admin.deleteProduct')}
        size="sm"
      >
        <div className="p-6 text-center">
          <p className="font-mono text-[#888888] text-sm mb-6">
            Delete <span className="text-white">{deleteTarget?.name_en}</span>? This cannot be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="danger" onClick={handleDelete}>
              {t('admin.delete')}
            </Button>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              {t('admin.cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
