import { addDays, differenceInDays, format, parseISO, subDays } from "date-fns";

export function formatDate(value: Date | string, dateFormat = "yyyy-MM-dd"): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, dateFormat);
}

export function dateRange(days: number, endDate = new Date()): Date[] {
  return Array.from({ length: days }, (_, index) => subDays(endDate, days - index - 1));
}

export function daysBetween(start: Date, end: Date): number {
  return differenceInDays(end, start);
}

export function addDaysTo(date: Date, daysToAdd: number): Date {
  return addDays(date, daysToAdd);
}
