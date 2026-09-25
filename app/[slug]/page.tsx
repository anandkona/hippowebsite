import { notFound, redirect } from "next/navigation";
import { getProductBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SlugRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (product) {
    redirect(`/products/${slug}`);
  }

  notFound();
}
