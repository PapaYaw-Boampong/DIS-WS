import type { StudentProfile } from "@/types/portal";

export const mockStudents = [
  {
    id: "student-001",
    userId: "user-student-001",
    fullName: "Ama Mensah",
    studentId: "DIS-2026-001",
    className: "Primary 6",
    level: "Primary School",
    parentIds: ["parent-001"],
    transportRouteId: "route-east-legon",
    feedingPlan: "termly",
  },
  {
    id: "student-002",
    fullName: "Kojo Mensah",
    studentId: "DIS-2026-002",
    className: "Primary 3",
    level: "Primary School",
    parentIds: ["parent-001"],
    feedingPlan: "weekly",
  },
] satisfies readonly StudentProfile[];
