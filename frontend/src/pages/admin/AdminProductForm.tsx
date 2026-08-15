import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Product } from "@mohini-artistry/shared";
import { adminProductSchema, CATEGORY_SEEDS } from "@mohini-artistry/shared";
import { adminApi } from "../../api/admin";
import { paiseToRupees, rupeesToPaise } from "../../lib/money";
import { ApiClientError } from "../../api/client";
import Spinner from "../../components/common/Spinner";
import { TrashIcon } from "../../components/common/icons";

const DEFAULT_CATEGORY_SLUG = CATEGORY_SEEDS[0]!.slug;

interface FormState {
  name: string;
  categorySlug: string;
  description: string;
  price: string;
  compareAt: string;
  stock: string;
  isNewArrival: boolean;
  isBestseller: boolean;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: "",
  categorySlug: DEFAULT_CATEGORY_SLUG,
  description: "",
  price: "",
  compareAt: "",
  stock: "0",
  isNewArrival: false,
  isBestseller: false,
  isActive: true,
};

const inputClass = "w-full rounded-lg border border-hairline px-3 py-2 text-sm focus:border-magenta focus:outline-none";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-teal">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-teal">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-hairline text-magenta" />
      {label}
    </label>
  );
}

export default function AdminProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // The admin list endpoint doesn't expose a fetch-by-id route, so editing an
  // existing product loads it out of the (search-filterable) list response.
  useEffect(() => {
    if (!id) return;
    adminApi.products
      .list({ limit: 100 })
      .then((res) => {
        const found = res.items.find((p) => p.id === Number(id));
        if (found) {
          setProduct(found);
          setForm({
            name: found.name,
            categorySlug: found.categorySlug ?? DEFAULT_CATEGORY_SLUG,
            description: found.description,
            price: String(paiseToRupees(found.pricePaise)),
            compareAt: found.compareAtPaise != null ? String(paiseToRupees(found.compareAtPaise)) : "",
            stock: String(found.stock),
            isNewArrival: found.isNewArrival,
            isBestseller: found.isBestseller,
            isActive: found.isActive,
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  async function refreshProduct(productId: number) {
    const res = await adminApi.products.list({ limit: 100 });
    const found = res.items.find((p) => p.id === productId);
    if (found) setProduct(found);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      name: form.name,
      categorySlug: form.categorySlug,
      description: form.description,
      pricePaise: rupeesToPaise(Number(form.price)),
      compareAtPaise: form.compareAt.trim() ? rupeesToPaise(Number(form.compareAt)) : null,
      stock: Number(form.stock),
      isNewArrival: form.isNewArrival,
      isBestseller: form.isBestseller,
      isActive: form.isActive,
    };

    const parsed = adminProductSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit && product) {
        await adminApi.products.update(product.id, parsed.data);
        navigate("/admin/products");
      } else {
        const created = await adminApi.products.create(parsed.data);
        navigate(`/admin/products/${created.id}/edit`);
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not save this product.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleImageUpload(file: File) {
    if (!product) return;
    setIsUploading(true);
    setError(null);
    try {
      await adminApi.products.uploadImage(product.id, file);
      await refreshProduct(product.id);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not upload image.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleImageDelete(imageId: number) {
    if (!product) return;
    await adminApi.products.deleteImage(product.id, imageId);
    await refreshProduct(product.id);
  }

  async function handleReorder(imageId: number, direction: -1 | 1) {
    if (!product) return;
    const sorted = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((img) => img.id === imageId);
    const swapWith = idx + direction;
    if (idx === -1 || swapWith < 0 || swapWith >= sorted.length) return;
    const a = sorted[idx]!;
    const b = sorted[swapWith]!;
    sorted[idx] = b;
    sorted[swapWith] = a;
    const items = sorted.map((img, i) => ({ imageId: img.id, sortOrder: i, isPrimary: i === 0 }));
    await adminApi.products.reorderImages(product.id, items);
    await refreshProduct(product.id);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const sortedImages = product ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-teal">{isEdit ? "Edit Product" : "New Product"}</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <Field label="Name">
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
        </Field>

        <Field label="Category">
          <select value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })} className={inputClass}>
            {CATEGORY_SEEDS.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className={inputClass}
            required
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Price (₹)">
            <input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} required />
          </Field>
          <Field label="Compare-at price (₹, optional)">
            <input type="number" min={0} step="0.01" value={form.compareAt} onChange={(e) => setForm({ ...form, compareAt: e.target.value })} className={inputClass} />
          </Field>
        </div>

        <Field label="Stock">
          <input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClass} required />
        </Field>

        <div className="flex flex-wrap gap-6">
          <Toggle label="New Arrival" checked={form.isNewArrival} onChange={(v) => setForm({ ...form, isNewArrival: v })} />
          <Toggle label="Bestseller" checked={form.isBestseller} onChange={(v) => setForm({ ...form, isBestseller: v })} />
          <Toggle label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={isSaving} className="rounded-full bg-teal px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          {isSaving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
      </form>

      {isEdit && product ? (
        <div className="mt-10 max-w-2xl">
          <h2 className="mb-3 font-display text-lg font-semibold text-teal">Images</h2>
          <div className="mb-4 flex flex-wrap gap-3">
            {sortedImages.map((img, i) => (
              <div key={img.id} className="relative h-24 w-24 overflow-hidden rounded-lg border border-hairline">
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                {img.isPrimary && (
                  <span className="absolute left-1 top-1 rounded bg-magenta px-1.5 py-0.5 text-[10px] font-semibold text-white">Primary</span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-1 py-0.5">
                  <button type="button" onClick={() => void handleReorder(img.id, -1)} disabled={i === 0} className="text-xs text-white disabled:opacity-30">
                    ←
                  </button>
                  <button type="button" onClick={() => void handleImageDelete(img.id)} className="text-white" aria-label="Delete image">
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleReorder(img.id, 1)}
                    disabled={i === sortedImages.length - 1}
                    className="text-xs text-white disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <label className="inline-block cursor-pointer rounded-full border border-teal px-4 py-2 text-sm font-semibold text-teal transition-colors hover:bg-teal hover:text-white">
            {isUploading ? "Uploading…" : "Upload Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImageUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      ) : (
        <p className="mt-8 max-w-2xl text-sm text-secondary">Save this product first to add images.</p>
      )}
    </div>
  );
}
