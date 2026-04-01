"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      router.push("/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400"
    >
      Logout
    </button>
  );
}
