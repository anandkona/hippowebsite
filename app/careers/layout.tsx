import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "Explore career opportunities, engineering roles, and open positions at HippoClouds.",
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

