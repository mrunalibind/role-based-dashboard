"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch((err) => console.error("Logout API failure", err));
      }

      localStorage.removeItem("token");
      localStorage.removeItem("role");
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
