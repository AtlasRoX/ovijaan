import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isPast, isFuture, isToday, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string, formatStr: string = "MMM d, yyyy"): string {
  if (!dateString) return "No date";
  try {
    const d = parseISO(dateString);
    return format(d, formatStr);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return "No date";
  try {
    const d = parseISO(dateString);
    return format(d, "MMM d, yyyy h:mm a");
  } catch {
    return dateString;
  }
}

export function getRelativeDeadline(dateString?: string): {
  text: string;
  isOverdue: boolean;
  isUrgent: boolean;
} {
  if (!dateString) {
    return { text: "No deadline", isOverdue: false, isUrgent: false };
  }

  try {
    const d = parseISO(dateString);
    if (isToday(d)) {
      return { text: "Due today", isOverdue: false, isUrgent: true };
    }
    if (isPast(d)) {
      const days = differenceInDays(new Date(), d);
      return {
        text: `${days === 0 ? "1" : days}d overdue`,
        isOverdue: true,
        isUrgent: true,
      };
    }
    const days = differenceInDays(d, new Date());
    return {
      text: days === 0 ? "Tomorrow" : `In ${days} days`,
      isOverdue: false,
      isUrgent: days <= 3,
    };
  } catch {
    return { text: dateString, isOverdue: false, isUrgent: false };
  }
}

export function formatCurrency(amount?: number, currency: string = "USD"): string {
  if (amount === undefined || amount === null) return "";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    // Competitions
    Interested: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
    "Planning to Apply": "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-300",
    "Application in Progress": "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300",
    Applied: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-300",
    "Registration Confirmed": "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300",
    Shortlisted: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-300",
    Participating: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-300",
    "Submission Completed": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300",
    Finalist: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 border-fuchsia-300 font-semibold",
    Winner: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-400 font-semibold",
    "Not Selected": "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300",
    Withdrawn: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300",
    Disqualified: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-400",
    Completed: "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-300",

    // Projects
    Idea: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border-violet-300",
    Planned: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-300",
    "In Progress": "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300",
    "On Hold": "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300",
    Archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300",

    // Tasks
    "To Do": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
    Blocked: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-300",
    Done: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300",
    Cancelled: "bg-gray-100 text-gray-500 line-through dark:bg-gray-800 dark:text-gray-400 border-gray-300",

    // Priority
    Low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    Medium: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
    High: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
    Urgent: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 font-medium",
  };

  return map[status] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200";
}
