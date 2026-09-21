import type { Post, PostKind } from "@/data/mock";
import { CommentIcon, HeartIcon, MegaphoneIcon, PhotoIcon } from "./icons";

const badgeStyles: Record<
  PostKind,
  { label: string; badge: string; dot: string; text: string }
> = {
  achievement: {
    label: "LOGRO",
    badge: "bg-[#CFEBD8]",
    dot: "bg-[#3E9B6C]",
    text: "text-[#3E9B6C]",
  },
  activity: {
    label: "ACTIVIDAD",
    badge: "bg-[#C7E7F1]",
    dot: "bg-[#2E89A6]",
    text: "text-[#2E89A6]",
  },
  announcement: {
    label: "ANUNCIO",
    badge: "bg-[#CCD8F4]",
    dot: "bg-[#4E72C8]",
    text: "text-[#4E72C8]",
  },
};

export function PostCard({ post }: { post: Post }) {
  const badge = badgeStyles[post.kind];

  return (
    <article className="bg-[#FFFDF9] border border-[#ECE0D0] rounded-[20px] px-[22px] py-5 shadow-[0_4px_16px_-12px_rgba(120,90,60,.5)]">
      <div className="flex items-center gap-3 mb-[14px]">
        {post.author.initial ? (
          <div className="w-[44px] h-[44px] rounded-full bg-[#A9D9E8] text-[#1F7A93] font-display font-semibold text-[17px] flex items-center justify-center flex-none">
            {post.author.initial}
          </div>
        ) : (
          <div className="w-[44px] h-[44px] rounded-full bg-[#CCD8F4] text-[#4E72C8] flex items-center justify-center flex-none">
            <MegaphoneIcon />
          </div>
        )}
        <div className="flex-1">
          <div className="font-display font-semibold text-[16.5px] text-[#3F362E]">
            {post.author.name}
          </div>
          <div className="text-[12.5px] text-[#A89A8B]">
            {post.time} · publicado por vos
          </div>
        </div>
        <div
          className={`flex items-center gap-[7px] px-3 py-[6px] rounded-full ${badge.badge}`}
        >
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          <span
            className={`text-[12px] font-extrabold tracking-[.5px] ${badge.text}`}
          >
            {badge.label}
          </span>
        </div>
      </div>

      <div className="text-[12.5px] text-[#A89A8B] mb-[10px]">
        {post.audience}
      </div>

      <p className="text-[15.5px] leading-[1.55] text-[#4A4038] m-0">
        {post.text}
      </p>

      {post.kind === "activity" && (
        <a
          href="#"
          className="flex flex-col items-center justify-center gap-2 mt-[14px] border-[1.5px] border-dashed border-[#DBCDBA] rounded-2xl bg-[#F4ECE1] h-[200px] text-[#B0A290]"
        >
          <PhotoIcon />
          <span className="text-[13.5px]">{post.photoLabel}</span>
        </a>
      )}

      <div className="flex items-center gap-[18px] mt-4 pt-[14px] border-t border-[#F0E6D8]">
        <span className="flex items-center gap-[7px] text-[#E0654A] font-bold text-[14px]">
          <HeartIcon />
          {post.feedback.likes}
        </span>
        <a
          href="#"
          className="flex items-center gap-[7px] text-[#94887B] font-bold text-[14px]"
        >
          <CommentIcon />
          {post.feedback.comments}
        </a>
        <span className="flex-1" />
        <a href="#" className="text-[#C5503A] font-extrabold text-[14px]">
          Editar
        </a>
      </div>
    </article>
  );
}
