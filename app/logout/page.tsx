"use client";

import LogoutButton from "@/app/components/LogoutButton";

export default function LogoutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-xl font-bold">Logout</h1>
        <p className="mb-4 text-sm text-slate-500">Click the button to clear session and return to login.</p>
        <LogoutButton />
      </div>
    </div>
  );
}