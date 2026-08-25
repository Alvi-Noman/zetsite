import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor';
import MediaDropzone, { type MediaFile } from '@/components/MediaDropzone';
import CollectionsPicker from '@/components/CollectionsPicker';
import VariantsEditor, { type VariantOption, type VariantRow } from '@/components/VariantsEditor';
import { Button, Input, Card } from '@/components/ui';

interface InitialVariant {
  label: string;
  values: string[];
  price?: number | null;
  sku?: string;
  available?: number;
  image?: string | null;
}

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [sku, setSku] = useState('');
  const [initialOptions, setInitialOptions] = useState<VariantOption[]>([]);
  const [initialVariants, setInitialVariants] = useState<InitialVariant[]>([]);
  const [options, setOptions] = useState<VariantOption[]>([]);
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/products/${id}`)
      .then((res) => {
        const p = res.data.product;
        setTitle(p.title);
        setDescription(p.description ?? '');
        setMedia(p.media ?? []);
        setCategory(p.category ?? '');
        setPrice(p.price !== undefined && p.price !== null ? String(p.price) : '');
        setCompareAtPrice(p.compareAtPrice !== undefined && p.compareAtPrice !== null ? String(p.compareAtPrice) : '');
        setSku(p.sku ?? '');
        setCollections(p.collections ?? []);
        setInitialOptions(p.options ?? []);
        setInitialVariants(p.variants ?? []);
      })
      .catch((err) => setError(err?.response?.data?.message ?? 'Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        media,
        category,
        price: price === '' ? undefined : Number(price),
        compareAtPrice: compareAtPrice === '' ? undefined : Number(compareAtPrice),
        sku,
        collections,
        options,
        variants: variantRows.map((v) => ({
          label: v.label,
          values: v.values,
          price: v.price === '' ? undefined : Number(v.price),
          sku: v.sku,
          available: v.available === '' ? 0 : Number(v.available),
          image: v.image,
        })),
      };

      if (isEditing) {
        await api.patch(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      navigate('/products');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? `Failed to ${isEditing ? 'update' : 'create'} product`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-secondary">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-6 text-2xl font-semibold text-ink">
        {isEditing ? 'Edit product' : 'Add product'}
      </h2>

      {error && (
        <div className="mb-4 rounded-md bg-danger-subtle px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="p-5">
          <label className="mb-1 block text-sm font-medium text-ink-secondary">Title</label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short sleeve t-shirt"
            className="mb-4"
          />

          <label className="mb-1 block text-sm font-medium text-ink-secondary">Description</label>
          <RichTextEditor value={description} onChange={setDescription} placeholder="Description" />
        </Card>

        <Card className="p-5">
          <label className="mb-2 block text-sm font-medium text-ink-secondary">Media</label>
          <MediaDropzone value={media} onChange={setMedia} />
        </Card>

        <Card className="p-5">
          <label className="mb-2 block text-sm font-medium text-ink-secondary">Collections</label>
          <CollectionsPicker value={collections} onChange={setCollections} />
        </Card>

        <Card className="p-5">
          <label className="mb-1 block text-sm font-medium text-ink-secondary">Category</label>
          <Input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Choose a product category"
            className="mb-1"
          />
          <p className="text-xs text-ink-tertiary">
            Determines tax rates and adds metafields to improve search, filters, and cross-channel
            sales
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex flex-wrap gap-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-secondary">Price</label>
              <div className="relative w-48">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-tertiary">
                  ৳
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-6"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-secondary">Compare at price</label>
              <div className="relative w-48">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-tertiary">
                  ৳
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-6"
                />
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-ink-tertiary">
            Used when this product has no variants below. Set a compare at price higher than the price to show
            it struck through as the original price on landing pages and product pages.
          </p>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-medium text-ink-secondary">Inventory (Optional)</h3>
          <label className="mb-1 block text-sm text-ink-secondary">SKU</label>
          <Input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="max-w-xs"
          />
        </Card>

        <Card className="p-5">
          <VariantsEditor
            initialOptions={initialOptions}
            initialVariants={initialVariants}
            media={media}
            onChange={(o, v) => {
              setOptions(o);
              setVariantRows(v);
            }}
          />
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/products')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Save product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
