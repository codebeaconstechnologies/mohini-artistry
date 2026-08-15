import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Coupon, CouponType } from "@mohini-artistry/shared";
import { adminCouponSchema } from "@mohini-artistry/shared";
import { adminApi } from "../../api/admin";
import { formatPaise, rupeesToPaise, paiseToRupees } from "../../lib/money";
import { ApiClientError } from "../../api/client";
import Spinner from "../../components/common/Spinner";

interface FormState {
  code: string;
  type: CouponType;
  value: string;
  minOrder: string;
  maxDiscount: string;
  isActive: boolean;
  perUserLimit: string;
  usageLimit: string;
}

const emptyForm: FormState = {
  code: "",
  type: "percent",
  value: "",
  minOrder: "0",
  maxDiscount: "",
  isActive: true,
  perUserLimit: "1",
  usageLimit: "",
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

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function load() {
    setIsLoading(true);
    adminApi.coupons
      .list()
      .then(setCoupons)
      .catch(() => setCoupons([]))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function openEdit(coupon: Coupon) {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.type === "flat" ? paiseToRupees(coupon.value) : coupon.value),
      minOrder: String(paiseToRupees(coupon.minOrderPaise)),
      maxDiscount: coupon.maxDiscountPaise != null ? String(paiseToRupees(coupon.maxDiscountPaise)) : "",
      isActive: coupon.isActive,
      perUserLimit: String(coupon.perUserLimit),
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : "",
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const value = form.type === "free_shipping" ? 0 : form.type === "flat" ? rupeesToPaise(Number(form.value)) : Number(form.value);

    const payload = {
      code: form.code,
      type: form.type,
      value,
      minOrderPaise: rupeesToPaise(Number(form.minOrder || "0")),
      maxDiscountPaise: form.maxDiscount.trim() ? rupeesToPaise(Number(form.maxDiscount)) : null,
      isActive: form.isActive,
      perUserLimit: Number(form.perUserLimit || "1"),
      usageLimit: form.usageLimit.trim() ? Number(form.usageLimit) : null,
    };

    const parsed = adminCouponSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await adminApi.coupons.update(editingId, parsed.data);
      } else {
        await adminApi.coupons.create(parsed.data);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not save this coupon.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivate(id: number) {
    if (!confirm("Deactivate this coupon?")) return;
    await adminApi.coupons.remove(id);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-teal">Coupons</h1>
        <button type="button" onClick={openCreate} className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white">
          + Add Coupon
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-hairline">
          <table className="min-w-full divide-y divide-hairline text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wide text-secondary">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Min Order</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono text-xs text-teal">{c.code}</td>
                  <td className="px-4 py-3 capitalize text-secondary">{c.type.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-secondary">{c.type === "percent" ? `${c.value}%` : c.type === "flat" ? formatPaise(c.value) : "—"}</td>
                  <td className="px-4 py-3 text-secondary">{formatPaise(c.minOrderPaise)}</td>
                  <td className="px-4 py-3 text-secondary">
                    {c.usageCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        c.isActive ? "bg-green-100 text-green-800" : "bg-cream text-secondary"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="space-x-3 px-4 py-3 text-right">
                    <button type="button" onClick={() => openEdit(c)} className="text-xs font-semibold text-turquoise underline">
                      Edit
                    </button>
                    <button type="button" onClick={() => void handleDeactivate(c.id)} className="text-xs font-semibold text-red-600 underline">
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} aria-hidden="true" />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-softwhite p-6 shadow-2xl">
            <h2 className="mb-4 font-display text-lg font-semibold text-teal">{editingId ? "Edit Coupon" : "New Coupon"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Code">
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className={inputClass} required />
              </Field>
              <Field label="Type">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })} className={inputClass}>
                  <option value="percent">Percent off</option>
                  <option value="flat">Flat amount off</option>
                  <option value="free_shipping">Free shipping</option>
                </select>
              </Field>
              {form.type !== "free_shipping" && (
                <Field label={form.type === "percent" ? "Percent off (0-100)" : "Amount off (₹)"}>
                  <input type="number" min={0} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={inputClass} required />
                </Field>
              )}
              <Field label="Minimum order (₹)">
                <input type="number" min={0} value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Max discount (₹, optional)">
                <input type="number" min={0} value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Per-user limit">
                  <input type="number" min={1} value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Total usage limit (optional)">
                  <input type="number" min={1} value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className={inputClass} />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-teal">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" />
                Active
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="rounded-full bg-teal px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {isSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
