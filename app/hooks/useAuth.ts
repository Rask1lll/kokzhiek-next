"use client";

import { useState, useEffect } from "react";
import { handleGetMe } from "../services/authorization/authApi";
import { UserData } from "../types/user";

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    handleGetMe().then((res) => {
      if (res) {
        setUser(res.data);
      }
      setLoading(false);
    });
  }, []);

  return { user, loading };
}
