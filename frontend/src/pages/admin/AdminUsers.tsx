import { useEffect, useState } from "react";
import type { User } from "@mohini-artistry/shared";
import { adminApi } from "../../api/admin";
import { useAuthStore } from "../../store/authStore";
import Spinner from "../../components/common/Spinner";

export default function AdminUsers() {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  function load() {
    setIsLoading(true);
    adminApi.users
      .list({ search: search || undefined, limit: 100 })
      .then((res) => setUsers(res.items))
      .catch(() => setUsers([]))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function toggleAdmin(user: User) {
    await adminApi.users.update(user.id, { isAdmin: !user.isAdmin });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-teal">Users</h1>
      <input
        type="text"
        placeholder="Search by email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-lg border border-hairline px-3 py-2 text-sm focus:border-magenta focus:outline-none"
      />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-hairline">
          <table className="min-w-full divide-y divide-hairline text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wide text-secondary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-teal">{u.fullName}</td>
                  <td className="px-4 py-3 text-secondary">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.isAdmin ? "bg-teal text-white" : "bg-cream text-secondary"}`}>
                      {u.isAdmin ? "Admin" : "Customer"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void toggleAdmin(u)}
                      disabled={u.id === currentUser?.id && u.isAdmin}
                      className="text-xs font-semibold text-turquoise underline disabled:opacity-30"
                      title={u.id === currentUser?.id && u.isAdmin ? "You cannot remove your own admin access" : undefined}
                    >
                      {u.isAdmin ? "Revoke Admin" : "Make Admin"}
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
