import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products", end: false },
  { to: "/admin/orders", label: "Orders", end: false },
  { to: "/admin/returns", label: "Refunds & Replacements", end: false },
  { to: "/admin/coupons", label: "Coupons", end: false },
  { to: "/admin/users", label: "Users", end: false },
];

// Server-side admin checks are the real gate (every /admin/* API route
// requires requireAdmin); this is UX-only so non-admins don't land on a
// broken screen.
export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  if (isHydrating) return null;
  if (!user?.isAdmin) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row">
      <aside className="shrink-0 md:w-56">
        <h2 className="mb-3 font-display text-lg font-semibold text-teal">Admin</h2>
        <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-teal text-white" : "text-secondary hover:bg-cream"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
