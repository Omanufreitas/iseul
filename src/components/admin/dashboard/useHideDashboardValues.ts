"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "iseul-admin-hide-dashboard-values";

export function useHideDashboardValues() {
  const [hidden, setHidden] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setHidden(localStorage.getItem(STORAGE_KEY) === "1");
    setReady(true);
  }, []);

  const toggle = useCallback(() => {
    setHidden((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  return { hidden: ready && hidden, toggle };
}

export const MASKED_CURRENCY = "R$ •••••";
