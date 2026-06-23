import type { ParentProfile } from "@/types/portal";

export const mockParents = [
  {
    id: "parent-001",
    userId: "user-parent-001",
    fullName: "Grace Mensah",
    phone: "+233 20 000 0001",
    email: "parent.demo@divineschool.edu.gh",
    childIds: ["student-001", "student-002"],
    status: "active",
  },
  {
    id: "parent-002",
    userId: "user-parent-002",
    fullName: "Patricia Osei",
    phone: "+233 20 000 0011",
    email: "patricia.osei@example.com",
    childIds: ["student-003"],
    status: "active",
  },
  {
    id: "parent-003",
    userId: "user-parent-003",
    fullName: "Kwesi Darko",
    phone: "+233 20 000 0012",
    email: "kwesi.darko@example.com",
    childIds: ["student-004"],
    status: "inactive",
  },
] satisfies readonly ParentProfile[];
