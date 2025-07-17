"use client";

import { useEffect } from "react";
import useHolidayStore from "@/stores/useHolidayStore";

export default function AppInitializer() {
  const loadHolidays = useHolidayStore((state) => state.loadHolidays);

  useEffect(() => {
    loadHolidays();
  }, []);

  return null;
}
