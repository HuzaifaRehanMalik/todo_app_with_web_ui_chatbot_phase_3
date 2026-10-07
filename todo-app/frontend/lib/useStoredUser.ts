"use client";

import { useMemo, useSyncExternalStore } from "react";
import { UserPublic } from "@/types/user";

// The signed-in user lives in localStorage. Reading it as an external store keeps
// it in sync on every render (e.g. after a route change) and across tabs, and
// renders null on the server so hydration matches.
const subscribeToStorage = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const getUserSnapshot = () => localStorage.getItem("user");
const getServerUserSnapshot = () => null;

function parseUser(json: string | null): UserPublic | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as UserPublic;
  } catch {
    return null;
  }
}

export function useStoredUser(): UserPublic | null {
  const userJson = useSyncExternalStore(subscribeToStorage, getUserSnapshot, getServerUserSnapshot);
  return useMemo(() => parseUser(userJson), [userJson]);
}
