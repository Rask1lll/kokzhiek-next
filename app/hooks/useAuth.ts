"use client";

import { useState, useEffect } from "react";
import { getAuthHeaders } from "../libs/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/me`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUser(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { user, loading };
}
