import { notFound } from "next/navigation";
import { KidProfile } from "@/app/components/KidProfile";
import { getKidBySlug } from "@/data/kids";

export default async function KidPage({ params }: PageProps<"/kids/[slug]">) {
  const { slug } = await params;
  const kid = getKidBySlug(slug);

  if (!kid) {
    notFound();
  }

  return (
    <div className="max-w-[820px] w-full mx-auto pt-[34px] px-10 pb-20">
      <KidProfile kid={kid} />
    </div>
  );
}
