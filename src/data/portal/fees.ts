import type { FeeItem, Invoice } from "@/types/portal";

export const mockFeeItems = [
  {
    id: "fee-school-term-1",
    title: "Term 1 School Fees",
    category: "school_fees",
    amount: 4200,
    term: "Term 1",
    academicYear: "2026/2027",
    dueDate: "2026-09-18",
  },
  {
    id: "fee-feeding-term-1",
    title: "Term 1 Feeding Plan",
    category: "feeding",
    amount: 950,
    term: "Term 1",
    academicYear: "2026/2027",
    dueDate: "2026-09-18",
  },
  {
    id: "fee-transport-term-1",
    title: "Term 1 Transport Service",
    category: "transport",
    amount: 1200,
    term: "Term 1",
    academicYear: "2026/2027",
    dueDate: "2026-09-18",
  },
] satisfies readonly FeeItem[];

export const mockInvoices = [
  {
    id: "invoice-001",
    studentId: "student-001",
    feeItemIds: ["fee-school-term-1", "fee-feeding-term-1"],
    totalAmount: 5150,
    amountPaid: 3000,
    balance: 2150,
    status: "partially_paid",
    dueDate: "2026-09-18",
  },
] satisfies readonly Invoice[];
