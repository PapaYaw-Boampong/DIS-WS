import type { Payment } from "@/types/portal";

export const mockPayments = [
  {
    id: "payment-001",
    parentId: "parent-001",
    studentId: "student-001",
    invoiceId: "invoice-001",
    category: "school_fees",
    amount: 3000,
    method: "momo",
    status: "successful",
    reference: "DIS-MOCK-0001",
    paidAt: "2026-06-20T10:30:00.000Z",
  },
] satisfies readonly Payment[];
