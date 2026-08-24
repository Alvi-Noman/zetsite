import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, ResponsiveImage, type ImageVariants } from '@/components/ui';

interface Product {
  id: string;
  title: string;
  price?: number | null;
  category: string;
  media: { url: string; type: string; variants?: ImageVariants }[];
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(res.data.products))
      .catch((err) => setError(err?.response?.data?.message ?? 'Failed to load products'));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-ink">Products</h2>
        <Button variant="primary" onClick={() => navigate('/products/new')}>
          <Plus size={16} />
          Add product
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-danger-subtle px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      {products === null && !error && <p className="text-sm text-ink-secondary">Loading...</p>}

      {products?.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface text-center">
          <Package size={28} className="mb-3 text-ink-tertiary" />
          <p className="text-sm font-medium text-ink">No products yet</p>
          <p className="mb-4 text-sm text-ink-secondary">Add your first product to get started.</p>
          <Button variant="primary" onClick={() => navigate('/products/new')}>
            Add product
          </Button>
        </div>
      )}

      {products && products.length > 0 && (
        <div className="overflow-hidden rounded-md border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-secondary text-xs uppercase tracking-wide text-ink-tertiary">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover"
                >
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-secondary">
                      {product.media[0]?.type === 'image' && (
                        <ResponsiveImage
                          variants={product.media[0].variants}
                          fallbackSrc={product.media[0].url}
                          alt={product.title}
                          sizes="40px"
                        />
                      )}
                    </div>
                    <span className="font-medium text-ink">{product.title}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{product.category || '—'}</td>
                  <td className="px-4 py-3 text-ink-secondary">
                    {product.price !== undefined && product.price !== null
                      ? `$${product.price.toFixed(2)}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
