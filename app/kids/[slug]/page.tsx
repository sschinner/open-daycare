import { notFound } from "next/navigation";
import { AppLayout } from "@/app/components/AppLayout";
import { KidProfile } from "@/app/components/KidProfile";
import { getKidBySlug, kids } from "@/data/kids";

export function generateStaticParams() {
  return kids.map((kid) => ({ slug: kid.slug }));
}

export default async function KidPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const kid = getKidBySlug(slug);

  if (!kid) {
    notFound();
  }

  return (
    <AppLayout active="kids">
      <div className="max-w-[820px] w-full mx-auto pt-[34px] px-10 pb-20">
        <KidProfile kid={kid} />
      </div>
    </AppLayout>
  );
}