"use client";

import { useState, useCallback } from "react";
import {
  handleGetActivationKeys,
  handleCreateActivationKey,
  handleDeleteActivationKey,
  ApiResult,
} from "../services/school/activationKeysApi";
import {
  ActivationKey,
  CreateActivationKeyPayload,
  GetActivationKeysParams,
} from "../types/activationKey";

export function useActivationKeys() {
  const [keys, setKeys] = useState<ActivationKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getKeys = useCallback(async (params?: GetActivationKeysParams) => {
    setIsLoading(true);
    const resData = await handleGetActivationKeys(params);
    if (resData?.data) {
      setKeys(resData.data);
    }
    setIsLoading(false);
    return resData;
  }, []);

  const createKey = useCallback(
    async (
      payload: CreateActivationKeyPayload
    ): Promise<ApiResult<ActivationKey[]>> => {
      const result = await handleCreateActivationKey(payload);
      if (result.success) {
        setKeys((prev) => [...result.data, ...prev]);
      }
      return result;
    },
    []
  );

  const deleteKey = useCallback(
    async (id: number): Promise<ApiResult<void>> => {
      const result = await handleDeleteActivationKey(id);
      if (result.success) {
        setKeys((prev) => prev.filter((k) => k.id !== id));
      }
      return result;
    },
    []
  );

  return { keys, isLoading, getKeys, createKey, deleteKey };
}
