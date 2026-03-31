"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      if (data.role === "super-admin") {
        router.push("/super-admin");
      } else if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-black px-6 py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Role-Based Dashboard</h1>
          <p className="mt-2 text-sm text-slate-200">Secure sign in for Super Admin, Admin & User</p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-200">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-lg border border-slate-500 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-200">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full rounded-lg border border-slate-500 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 active:scale-95"
          >
            Login
          </button>
        </div>

        <p className="text-center text-xs text-slate-300">
          Use email and password for permission-based redirection.
        </p>
      </div>
    </div>
  );
}