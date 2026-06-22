import type { StaffProfile } from "@/types/portal";

export const mockStaff = [
  {
    id: "staff-001",
    userId: "user-staff-001",
    fullName: "Daniel Owusu",
    staffId: "DIS-STF-014",
    title: "Primary Class Teacher",
    classIds: ["primary-6"],
    subjectIds: ["mathematics", "science"],
  },
] satisfies readonly StaffProfile[];
