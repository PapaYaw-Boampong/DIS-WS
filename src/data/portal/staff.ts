import type { StaffProfile } from "@/types/portal";

export const mockStaff = [
  {
    id: "staff-001",
    userId: "user-staff-001",
    fullName: "Daniel Owusu",
    staffId: "DIS-STF-014",
    title: "Primary Class Teacher",
    classIds: ["primary-6", "primary-5", "primary-3", "jhs-1"],
    subjectIds: ["mathematics", "science"],
  },
] satisfies readonly StaffProfile[];
