"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";

export default function AdminPage() {
    useAuth("admin");

    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchUsers = async () => {
        const res = await fetch("/api/user", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        setUsers(data.users || []);
    };

    const createUser = async () => {
        const res = await fetch("/api/user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message);
            return;
        }

        alert("User created");

        setName("");
        setEmail("");
        setPassword("");

        fetchUsers();
    };

    const deleteUser = async (id: string) => {
        await fetch(`/api/user/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        fetchUsers();
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="rounded-2xl bg-indigo-500/20 p-6 backdrop-blur border border-indigo-200/20">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="mt-1 text-sm text-indigo-100/90">
                        Manage users assigned to your admin account.
                    </p>
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
                    <button
                        onClick={createUser}
                        className="mt-4 inline-flex items-center justify-center rounded-lg bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 active:scale-[0.98]"
                    >
                        Create User
                    </button>
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
                                            <td className="px-4 py-3">
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
                </section>
            </div>
        </div>
    );
}