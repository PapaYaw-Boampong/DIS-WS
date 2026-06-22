import type { ParentProfile } from "@/types/portal";

export const mockParents = [
  {
    id: "parent-001",
    userId: "user-parent-001",
    fullName: "Grace Mensah",
    phone: "+233 20 000 0001",
    email: "parent.demo@divineschool.edu.gh",
    childIds: ["student-001", "student-002"],
  },
] satisfies readonly ParentProfile[];
