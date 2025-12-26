"use client";

import { useState, useEffect } from "react";
import { handleGetMe, handleLogout } from "../services/authorization/authApi";
import { UserData } from "../types/user";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const logout = async () => {
    await handleLogout();
    router.push("/auth/login");
  };

  useEffect(() => {
    handleGetMe().then((res) => {
      if (res) {
        setUser(res.data);
      }
      setLoading(false);
    });
  }, []);

  return { user, loading, logout };
}
