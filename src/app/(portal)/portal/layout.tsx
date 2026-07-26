import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Portal",
    template: "%s | Divine International School Portal",
  },
  description:
    "Mock portal foundation for Divine International School role-based access.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortalRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
