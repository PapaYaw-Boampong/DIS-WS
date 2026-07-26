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
    status: "active",
  },
  {
    id: "staff-002",
    userId: "user-staff-002",
    fullName: "Adwoa Frimpong",
    staffId: "DIS-STF-021",
    title: "English Teacher",
    classIds: ["primary-6", "primary-5"],
    subjectIds: ["english"],
    status: "active",
  },
  {
    id: "staff-003",
    userId: "user-staff-003",
    fullName: "Emmanuel Annan",
    staffId: "DIS-STF-028",
    title: "JHS Class Teacher",
    classIds: ["jhs-1"],
    subjectIds: ["science"],
    status: "inactive",
  },
] satisfies readonly StaffProfile[];
