const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-GH", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function formatPortalCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatPortalDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00.000Z`));
}

export function formatPortalTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function percentageScore(score: number, total: number) {
  return Math.round((score / total) * 100);
}

export function formatFeeCategory(value: string) {
  const labels: Record<string, string> = {
    school_fees: "School Fees",
    feeding: "Feeding Fees",
    transport: "Transport Fees",
    uniform: "Uniform Fees",
    books: "Books & Materials",
    exam: "Examination Fees",
    other: "Other Charges",
  };

  return labels[value] ?? value;
}

export function formatPaymentMethod(value: string) {
  const labels: Record<string, string> = {
    momo: "Mobile Money",
    card: "Card",
    bank_transfer: "Bank Transfer",
    cash: "Cash",
    manual: "Manual Entry",
  };

  return labels[value] ?? value;
}
