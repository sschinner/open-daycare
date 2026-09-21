import Link from "next/link";
import type { Kid } from "@/data/kids";
import { ChevronRightIcon } from "./icons";

function parentLabel(count: number): string {
  if (count === 0) return "sin padres vinculados";
  return `${count} padre${count === 1 ? "" : "s"} vinculado${count === 1 ? "" : "s"}`;
}

export function KidCard({ kid }: { kid: Kid }) {
  const badgeClass = "flex-none text-[11px] font-extrabold px-[9px] py-[5px] rounded-full";

  return (
    <Link
      href={`/kids/${kid.slug}`}
      className="flex items-center gap-[14px] min-w-0 bg-[#FFFDF9] border border-[#ECE0D0] rounded-[18px] p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,.5)] hover:border-[#F2A78E] hover:-translate-y-0.5 transition"
    >
      <div
        className="w-12 h-12 rounded-full font-display font-semibold text-[19px] flex items-center justify-center flex-none"
        style={{ backgroundColor: kid.avatarBg, color: kid.avatarText }}
      >
        {kid.initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-semibold text-[16px] text-[#3F362E]">
          {kid.name}
        </div>
        <div className="text-[13px] text-[#A89A8B]">
          {kid.age} años · {parentLabel(kid.parents.length)}
        </div>
      </div>
      {kid.parents.length === 0 ? (
        <span className={`${badgeClass} bg-[#F9D2DE] text-[#C56486]`}>VINCULAR</span>
      ) : kid.allergy ? (
        <span className={`${badgeClass} bg-[#FBD8CC] text-[#D9684A]`}>
          {kid.allergy.label === "peanut" ? "MANÍ" : "LACTOSA"}
        </span>
      ) : (
        <ChevronRightIcon className="flex-none text-[#CBB89F]" />
      )}
    </Link>
  );
}