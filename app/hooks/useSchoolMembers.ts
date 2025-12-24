"use client";

import { useState, useCallback } from "react";
import { handleGetSchoolMembers } from "../services/school/membersApi";
import { Member, GetMembersParams } from "../types/member";

export function useSchoolMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getMembers = useCallback(async (params?: GetMembersParams) => {
    setIsLoading(true);
    const resData = await handleGetSchoolMembers(params);
    if (resData?.data) {
      setMembers(resData.data);
    }
    setIsLoading(false);
    return resData;
  }, []);

  return { members, isLoading, getMembers };
}
