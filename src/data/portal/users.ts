import type { PortalUser } from "@/types/portal";

export const mockPortalUsers = [
  {
    id: "user-student-001",
    name: "Ama Mensah",
    email: "student.demo@divineschool.edu.gh",
    role: "student",
    status: "active",
  },
  {
    id: "user-parent-001",
    name: "Grace Mensah",
    email: "parent.demo@divineschool.edu.gh",
    role: "parent",
    status: "active",
  },
  {
    id: "user-staff-001",
    name: "Daniel Owusu",
    email: "staff.demo@divineschool.edu.gh",
    role: "staff",
    status: "active",
  },
  {
    id: "user-admin-001",
    name: "Akosua Boateng",
    email: "admin.demo@divineschool.edu.gh",
    role: "admin",
    status: "active",
  },
  {
    id: "user-accounts-001",
    name: "Michael Addo",
    email: "accounts.demo@divineschool.edu.gh",
    role: "accounts",
    status: "active",
  },
  {
    id: "user-transport-001",
    name: "Samuel Tetteh",
    email: "transport.demo@divineschool.edu.gh",
    role: "transport",
    status: "active",
  },
] satisfies readonly PortalUser[];
