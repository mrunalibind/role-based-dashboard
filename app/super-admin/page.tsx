"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import LogoutButton from "@/app/components/LogoutButton";

interface Admin { _id: string; name: string; email: string; }
interface User { _id: string; name: string; email: string; createdBy: string; }

const INITIAL_ADMIN_FORM = { name: "", email: "", password: "", id: "" };
const INITIAL_USER_FORM = { name: "", email: "", password: "", adminId: "", id: "" };

function headers(token: string | null, useJson = true) {
  if (!token) return {};
  return {
    ...(useJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  };
}

export default function SuperAdminPage() {
  useAuth("super-admin");

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [adminForm, setAdminForm] = useState(INITIAL_ADMIN_FORM);
  const [userForm, setUserForm] = useState(INITIAL_USER_FORM);

  const [token, setToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdminFormValid = useMemo(
    () => adminForm.name.trim() && adminForm.email.trim() && (adminForm.id || adminForm.password.trim()),
    [adminForm]
  );

  const isUserFormValid = useMemo(
    () => userForm.name.trim() && userForm.email.trim() && (userForm.id || userForm.password.trim()) && userForm.adminId,
    [userForm]
  );

  const fetchAdmins = async () => {
    if (!token) return;

    try {
      const res = await fetch("/api/admin", { headers: headers(token) });
      if (!res.ok) throw new Error("Failed to fetch admins");
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (err) {
      setError((err as Error).message || "Unable to load admins");
    }
  };

  const fetchUsers = async () => {
    if (!token) return;

    try {
      const res = await fetch("/api/user", { headers: headers(token) });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError((err as Error).message || "Unable to load users");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    Promise.all([fetchAdmins(), fetchUsers()]).finally(() => setIsLoading(false));
  }, [token]);

  const handleAdminSubmit = async () => {
    if (!isAdminFormValid || !token) return;
    setIsSubmitting(true);
    setError(null);

    const isUpdate = Boolean(adminForm.id);
    const method = isUpdate ? "PUT" : "POST";
    const url = isUpdate ? `/api/admin/${adminForm.id}` : "/api/admin";

    try {
      const res = await fetch(url, {
        method,
        headers: headers(token),
        body: JSON.stringify({ name: adminForm.name, email: adminForm.email, password: adminForm.password }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Unable to save admin");

      alert(isUpdate ? "Admin updated successfully" : "Admin created successfully");
      setAdminForm(INITIAL_ADMIN_FORM);
      await fetchAdmins();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserSubmit = async () => {
    if (!isUserFormValid || !token) return;
    setIsSubmitting(true);
    setError(null);

    const isUpdate = Boolean(userForm.id);
    const method = isUpdate ? "PUT" : "POST";
    const url = isUpdate ? `/api/user/${userForm.id}` : "/api/user";

    try {
      const res = await fetch(url, {
        method,
        headers: headers(token),
        body: JSON.stringify({
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          adminId: userForm.adminId,
          createdBy: userForm.adminId,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Unable to save user");

      alert(isUpdate ? "User updated successfully" : "User created successfully");
      setUserForm(INITIAL_USER_FORM);
      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editAdmin = (admin: Admin) => {
    setAdminForm({ name: admin.name, email: admin.email, password: "", id: admin._id });
  };

  const deleteAdmin = async (id: string) => {
    if (!token || !confirm("Delete this admin?")) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/${id}`, { method: "DELETE", headers: headers(token, false) });
      if (!res.ok) throw new Error("Unable to delete admin");
      await fetchAdmins();
      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editUser = (user: User) => {
    setUserForm({ name: user.name, email: user.email, password: "", adminId: user.createdBy, id: user._id });
  };

  const deleteUser = async (id: string) => {
    if (!token || !confirm("Delete this user?")) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/user/${id}`, { method: "DELETE", headers: headers(token, false) });
      if (!res.ok) throw new Error("Unable to delete user");
      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-3 rounded-2xl bg-indigo-500/20 p-6 backdrop-blur border border-indigo-200/20 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
            <p className="mt-1 text-sm text-indigo-100/90">Manage admins, users, and assignments with enhanced controls.</p>
          </div>
          <LogoutButton />
        </header>

        {error && (
          <div className="rounded-lg border border-rose-400/80 bg-rose-500/10 px-4 py-3 text-rose-200">{error}</div>
        )}

        {isLoading ? (
          <div className="rounded-2xl bg-slate-900/70 border border-slate-700 p-8 text-center">Loading data…</div>
        ) : (
          <>
            <section className="rounded-2xl bg-slate-900/70 border border-slate-700 p-5">
              <h2 className="text-xl font-semibold mb-4">Admins</h2>
              <div className="grid gap-3 md:grid-cols-4">
                <input
                  className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Name"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Email"
                  value={adminForm.email}
                  type="email"
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, email: e.target.value }))}
                />
                <input
                  className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Password"
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, password: e.target.value }))}
                />
                <button
                  onClick={handleAdminSubmit}
                  disabled={!isAdminFormValid || isSubmitting}
                  className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {adminForm.id ? "Update Admin" : "Create Admin"}
                </button>
              </div>

              <div className="mt-6 overflow-x-auto rounded-lg border border-slate-700">
                <table className="min-w-full divide-y divide-slate-700 text-sm">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-300">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-300">Email</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {admins.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-center text-slate-400">No admins found.</td>
                      </tr>
                    ) : (
                      admins.map((admin) => (
                        <tr key={admin._id} className="hover:bg-slate-800/70">
                          <td className="px-4 py-3">{admin.name}</td>
                          <td className="px-4 py-3">{admin.email}</td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => editAdmin(admin)}
                              className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-400"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteAdmin(admin._id)}
                              className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-medium text-white hover:bg-rose-400"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl bg-slate-900/70 border border-slate-700 p-5">
              <h2 className="text-xl font-semibold mb-4">Users</h2>
              <div className="grid gap-3 md:grid-cols-5">
                <input
                  className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Name"
                  value={userForm.name}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                />
                <input
                  className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                />
                <select
                  className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  value={userForm.adminId}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, adminId: e.target.value }))}
                >
                  <option value="">Select Admin</option>
                  {admins.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleUserSubmit}
                  disabled={!isUserFormValid || isSubmitting}
                  className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {userForm.id ? "Update User" : "Create User"}
                </button>
              </div>

              <div className="mt-6 overflow-x-auto rounded-lg border border-slate-700">
                <table className="min-w-full divide-y divide-slate-700 text-sm">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-300">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-300">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-300">Admin</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-slate-400">No users found.</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-800/70">
                          <td className="px-4 py-3">{user.name}</td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3">{user.createdBy}</td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => editUser(user)}
                              className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-400"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-medium text-white hover:bg-rose-400"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
