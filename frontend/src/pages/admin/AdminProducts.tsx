import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@mohini-artistry/shared";
import { adminApi } from "../../api/admin";
import { formatPaise } from "../../lib/money";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  function load() {
    setIsLoading(true);
    adminApi.products
      .list({ search: search || undefined, limit: 100 })
      .then((res) => setProducts(res.items))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleDeactivate(id: number) {
    if (!confirm("Deactivate this product? It will no longer be visible to customers.")) return;
    await adminApi.products.remove(id);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-teal">Products</h1>
        <Link to="/admin/products/new" className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white">
          + Add Product
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-lg border border-hairline px-3 py-2 text-sm focus:border-magenta focus:outline-none"
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="No products found" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-hairline">
          <table className="min-w-full divide-y divide-hairline text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wide text-secondary">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream">
                      {p.images[0] && <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <span className="font-medium text-teal">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-secondary">{p.categoryName}</td>
                  <td className="px-4 py-3 text-teal">{formatPaise(p.pricePaise)}</td>
                  <td className="px-4 py-3 text-secondary">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.isActive ? "bg-green-100 text-green-800" : "bg-cream text-secondary"
                      }`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="space-x-3 px-4 py-3 text-right">
                    <Link to={`/admin/products/${p.id}/edit`} className="text-xs font-semibold text-turquoise underline">
                      Edit
                    </Link>
                    <button type="button" onClick={() => void handleDeactivate(p.id)} className="text-xs font-semibold text-red-600 underline">
                      Deactivate
                    </button>
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
