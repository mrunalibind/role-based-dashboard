"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import LogoutButton from "@/app/components/LogoutButton";

export default function AdminPage() {
    useAuth("admin");

    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchUsers = async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/user?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            setUsers(data.users || []);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setEditingUserId(null);
    };

    const saveUser = async () => {
        if (!name.trim() || !email.trim()) {
            alert("Both name and email are required.");
            return;
        }

        if (!editingUserId && !password.trim()) {
            alert("Password is required for new users.");
            return;
        }

        const method = editingUserId ? "PUT" : "POST";
        const url = editingUserId ? `/api/user/${editingUserId}` : "/api/user";

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, email, password: password || undefined }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Could not save user.");
            return;
        }

        alert(editingUserId ? "User updated" : "User created");
        resetForm();
        fetchUsers();
    };

    const deleteUser = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        const res = await fetch(`/api/user/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const data = await res.json();
            alert(data.message || "Could not delete user.");
            return;
        }

        fetchUsers();
    };

    const editUser = (user: any) => {
        setEditingUserId(user._id);
        setName(user.name || "");
        setEmail(user.email || "");
        setPassword("");
    };

    useEffect(() => {
        fetchUsers();
    }, [token, page, limit]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex items-center justify-between rounded-2xl bg-indigo-500/20 p-6 backdrop-blur border border-indigo-200/20">
                    <div>
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p className="mt-1 text-sm text-indigo-100/90">
                            Manage users assigned to your admin account.
                        </p>
                    </div>
                    <LogoutButton />
                </header>

                <section className="rounded-2xl bg-slate-900/70 border border-slate-700 p-5">
                    <h2 className="text-xl font-semibold mb-4">Create User</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <input
                            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <button
                            onClick={saveUser}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 active:scale-[0.98]"
                        >
                            {editingUserId ? "Update User" : "Create User"}
                        </button>
                        {editingUserId && (
                            <button
                                onClick={resetForm}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:bg-slate-700"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </section>

                <section className="rounded-2xl bg-slate-900/70 border border-slate-700 p-5">
                    <h2 className="text-xl font-semibold mb-4">Your Users</h2>

                    <div className="overflow-x-auto rounded-lg border border-slate-700">
                        <table className="min-w-full divide-y divide-slate-700 text-sm">
                            <thead className="bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-slate-300">Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-300">Email</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-4 text-center text-slate-400">
                                            No users found yet.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user: any) => (
                                        <tr key={user._id} className="hover:bg-slate-800/80">
                                            <td className="px-4 py-3">{user.name}</td>
                                            <td className="px-4 py-3">{user.email}</td>
                                            <td className="px-4 py-3 space-x-2">
                                                <button
                                                    onClick={() => editUser(user)}
                                                    className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-400"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(user._id)}
                                                    className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-rose-400"
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

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 border border-slate-700 p-3 rounded-lg">
                        <div className="text-sm text-slate-300">
                            Showing page {page} of {totalPages} ({totalItems} users)
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                            >
                                {[5, 10, 20, 50].map((option) => (
                                    <option key={option} value={option}>
                                        {option} per page
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="rounded border border-slate-600 bg-slate-800 px-3 py-1 text-sm text-slate-100 disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="rounded border border-slate-600 bg-slate-800 px-3 py-1 text-sm text-slate-100 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </section>
            </div>
            
        </div>
    );
}