"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
      router.replace("/login");
      setIsChecking(false);
      return;
    }

    if (role === "super-admin") {
      router.replace("/super-admin");
    } else if (role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/user");
    }

    setIsChecking(false);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="rounded-xl border border-white/20 bg-black/30 p-8 text-center shadow-xl backdrop-blur">
        {isChecking ? (
          <>
            <p className="text-lg font-semibold">Checking authentication…</p>
            <p className="text-sm text-slate-400">Redirecting to the correct page</p>
          </>
        ) : (
          <p className="text-lg font-semibold">Redirecting…</p>
        )}
      </div>
    </div>
  );
}
