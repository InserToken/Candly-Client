"use client";

import { useEffect } from "react";
import useHolidayStore from "@/stores/useHolidayStore";

export default function AppInitializer() {
  const loadHolidays = useHolidayStore((state) => state.loadHolidays);

  useEffect(() => {
    loadHolidays();

    const interval = setInterval(() => {
      loadHolidays();
    }, 1000 * 60 * 60 * 24);

    return () => clearInterval(interval);
  }, []);

  return null;
}
