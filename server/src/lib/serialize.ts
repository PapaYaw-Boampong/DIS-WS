import type { User } from "@prisma/client";

// The Next.js portal expects lowercase role/status values (e.g. "student",
// "active"), matching its existing PortalUser shape.
export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  mustChangePassword: boolean;
};

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    status: user.status.toLowerCase(),
    mustChangePassword: user.mustChangePassword,
  };
}
