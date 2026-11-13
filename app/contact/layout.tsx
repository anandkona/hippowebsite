import { Metadata } from "next";
import { getSeoMetadata } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata('/contact');
  if (!seo) {
    return {
      title: "Contact Us",
      description: "Get in touch with HippoClouds enterprise technology consultants and engineers.",
    };
  }

  return {
    title: seo.title || "Contact Us",
    description: seo.description,
    keywords: seo.keywords,
  };
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

