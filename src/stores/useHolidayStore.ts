// src/store/useHolidayStore.ts
import { create } from "zustand";

type HolidayState = {
  holidaySet: Set<string> | null;
  loadHolidays: () => Promise<void>;
};

const useHolidayStore = create<HolidayState>((set) => ({
  holidaySet: null,
  loadHolidays: async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/holiday`);
    const data: string[] = await res.json();
    set({ holidaySet: new Set(data) });
  },
}));

export default useHolidayStore;
