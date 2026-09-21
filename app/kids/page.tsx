"use client";

import { useState } from "react";
import { AddKidModal } from "@/app/components/AddKidModal";
import { AppLayout } from "@/app/components/AppLayout";
import { KidCard } from "@/app/components/KidCard";
import { PlusIcon, SearchIcon } from "@/app/components/icons";
import { room } from "@/data/mock";
import { kids } from "@/data/kids";
import type { Kid } from "@/data/kids";

export default function KidsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [extraKids, setExtraKids] = useState<Kid[]>([]);

  function handleSave(kid: Kid) {
    setExtraKids((prev) => [...prev, kid]);
    setIsOpen(false);
  }

  const cards = [
    ...kids.map((kid) => ({ kid, isStatic: false })),
    ...extraKids.map((kid) => ({ kid, isStatic: true })),
  ];

  return (
    <AppLayout active="kids">
      <div className="max-w-[880px] w-full mx-auto pt-[34px] px-10 pb-20">
        <div className="flex items-end justify-between gap-4 mb-[22px]">
          <div>
            <div className="text-[12.5px] font-extrabold tracking-[.8px] text-[#D9583C] mb-1">
              GESTIÓN
            </div>
            <h1 className="font-display font-semibold text-[30px] m-0 text-[#3F362E]">
              Niños
            </h1>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-[18px] py-[11px] rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] text-white font-extrabold text-[14.5px] shadow-[0_8px_18px_-8px_rgba(238,129,100,.7)]"
          >
            <PlusIcon />
            Agregar niño
          </button>
        </div>

        <div className="flex items-center gap-[11px] bg-[#FFFDF9] border border-[#ECE0D0] rounded-[14px] px-4 py-3 mb-[22px]">
          <SearchIcon className="text-[#B0A290]" />
          <input
            placeholder="Buscar niño…"
            className="flex-1 bg-transparent border-none text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 mb-[14px]">
          <span className="text-[12.5px] font-extrabold tracking-[.8px] text-[#3F362E]">
            {room.name.toUpperCase()}
          </span>
          <span className="text-[13px] text-[#A89A8B]">
            {kids.length + extraKids.length} niños
          </span>
          <span className="flex-1 h-px bg-[#E7DAC8]" />
        </div>

        <div className="grid grid-cols-2 gap-[14px]">
          {cards.map(({ kid, isStatic }) => (
            <KidCard key={kid.slug} kid={kid} static={isStatic} />
          ))}
        </div>
      </div>

      {isOpen && (
        <AddKidModal onClose={() => setIsOpen(false)} onSave={handleSave} />
      )}
    </AppLayout>
  );
}