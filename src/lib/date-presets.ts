import { addDays, endOfDay, startOfDay, toDateInputValue } from "@/lib/dashboard-dates";

export type DatePreset = {
  id: string;
  label: string;
  getRange: () => { from: string; to: string };
};

export const DATE_PRESETS: DatePreset[] = [
  {
    id: "7d",
    label: "7 dias",
    getRange: () => {
      const to = endOfDay(new Date());
      return { from: toDateInputValue(addDays(to, -6)), to: toDateInputValue(to) };
    },
  },
  {
    id: "30d",
    label: "30 dias",
    getRange: () => {
      const to = endOfDay(new Date());
      return { from: toDateInputValue(addDays(to, -29)), to: toDateInputValue(to) };
    },
  },
  {
    id: "90d",
    label: "90 dias",
    getRange: () => {
      const to = endOfDay(new Date());
      return { from: toDateInputValue(addDays(to, -89)), to: toDateInputValue(to) };
    },
  },
  {
    id: "month",
    label: "Este mês",
    getRange: () => {
      const now = new Date();
      const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      return { from: toDateInputValue(from), to: toDateInputValue(endOfDay(now)) };
    },
  },
  {
    id: "last-month",
    label: "Mês passado",
    getRange: () => {
      const now = new Date();
      const from = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const to = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      return { from: toDateInputValue(from), to: toDateInputValue(to) };
    },
  },
  {
    id: "year",
    label: "Este ano",
    getRange: () => {
      const now = new Date();
      const from = startOfDay(new Date(now.getFullYear(), 0, 1));
      return { from: toDateInputValue(from), to: toDateInputValue(endOfDay(now)) };
    },
  },
  {
    id: "all",
    label: "Tudo",
    getRange: () => ({ from: "2020-01-01", to: toDateInputValue(endOfDay(new Date())) }),
  },
];

export function getAllDateRange() {
  return DATE_PRESETS.find((p) => p.id === "all")!.getRange();
}
