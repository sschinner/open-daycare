import Link from "next/link";
import type { Kid, Parent } from "@/data/kids";
import { room } from "@/data/mock";
import { AlertIcon, ArrowLeftIcon, LogoIcon, PlusIcon } from "./icons";

function parentStatusBadge(status: Parent["status"]): { text: string; className: string } {
  return status === "active"
    ? { text: "ACTIVA", className: "bg-[#CFEBD8] text-[#3E9B6C]" }
    : { text: "PENDIENTE", className: "bg-[#F7E7A6] text-[#9A7B1E]" };
}

export function KidProfile({ kid }: { kid: Kid }) {
  const roomShortName = room.name.split(" ").at(-1) ?? room.name;

  return (
    <>
      <Link
        href="/kids"
        className="flex items-center gap-[7px] text-[#94887B] font-bold text-[14px] mb-5"
      >
        <ArrowLeftIcon />
        Volver a Niños
      </Link>

      <div className="flex gap-[26px] items-start flex-wrap">
        <div className="flex-1 min-w-[300px] flex flex-col gap-[18px]">
          <div className="flex items-center gap-[18px]">
            <div
              className="w-[84px] h-[84px] rounded-full font-display font-semibold text-[34px] flex items-center justify-center flex-none"
              style={{ backgroundColor: kid.avatarBg, color: kid.avatarText }}
            >
              {kid.initial}
            </div>
            <div className="flex-1">
              <h1 className="font-display font-semibold text-[28px] m-0 text-[#3F362E]">
                {kid.name}
              </h1>
              <p className="mt-[3px] mb-0 text-[#94887B] text-[15px]">
                {kid.age} años · {room.name}
              </p>
            </div>
            <a
              href="#"
              className="border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359] font-bold text-[14px] px-4 py-[9px] rounded-xl"
            >
              Editar
            </a>
          </div>

          {kid.allergy && (
            <div className="flex gap-[14px] bg-[#FBDAD6] rounded-2xl px-[18px] py-4">
              <div className="w-10 h-10 rounded-[11px] bg-[#F4A8A0] flex items-center justify-center flex-none">
                <AlertIcon className="text-white" />
              </div>
              <div>
                <div className="font-extrabold text-[#C5413A] text-[15px] mb-[2px]">
                  Alergias y notas
                </div>
                <div className="text-[#B25249] text-[14.5px] leading-[1.5]">
                  {kid.allergy.note}
                </div>
              </div>
            </div>
          )}

          <div className="bg-[#FFFDF9] border border-[#ECE0D0] rounded-2xl overflow-hidden">
            <div className="flex justify-between px-[18px] py-[15px] border-b border-[#F0E6D8]">
              <span className="text-[#94887B] text-[14.5px]">Fecha de nacimiento</span>
              <span className="font-extrabold text-[#3F362E] text-[14.5px]">{kid.birthdate}</span>
            </div>
            <div className="flex justify-between px-[18px] py-[15px] border-b border-[#F0E6D8]">
              <span className="text-[#94887B] text-[14.5px]">Sala</span>
              <span className="font-extrabold text-[#3F362E] text-[14.5px]">{roomShortName}</span>
            </div>
            <div className="flex justify-between px-[18px] py-[15px]">
              <span className="text-[#94887B] text-[14.5px]">Ingreso</span>
              <span className="font-extrabold text-[#3F362E] text-[14.5px]">{kid.enrolled}</span>
            </div>
          </div>
        </div>

        <div className="w-[300px] flex-none flex flex-col gap-[14px]">
          <a
            href="#"
            className="flex items-center justify-center gap-[9px] w-full p-[13px] rounded-[14px] bg-[#3F362E] text-white font-extrabold text-[15px]"
          >
            <LogoIcon className="text-white" />
            Resumen del día
          </a>

          <div className="bg-[#FFFDF9] border border-[#ECE0D0] rounded-2xl px-[18px] py-4">
            <div className="text-[12.5px] font-extrabold tracking-[.8px] text-[#8A7C6D] mb-[14px]">
              PADRES VINCULADOS
            </div>

            {kid.parents.length > 0 && (
              <div className="flex flex-col gap-[14px]">
                {kid.parents.map((parent) => {
                  const badge = parentStatusBadge(parent.status);
                  return (
                    <div key={parent.name} className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full font-display font-semibold text-[16px] text-white flex items-center justify-center flex-none"
                        style={{ backgroundColor: parent.avatarBg }}
                      >
                        {parent.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-[14.5px] text-[#3F362E]">
                          {parent.name}
                        </div>
                        <div className="text-[12.5px] text-[#A89A8B]">
                          {parent.relation} · {parent.statusText}
                        </div>
                      </div>
                      <span
                        className={`flex-none text-[10.5px] font-extrabold px-[9px] py-1 rounded-full ${badge.className}`}
                      >
                        {badge.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <a href="#" className="flex items-center gap-3 pt-2">
              <span className="w-10 h-10 rounded-full border-[1.5px] border-dashed border-[#D8CBBA] flex items-center justify-center text-[#B0A290] flex-none">
                <PlusIcon />
              </span>
              <span className="font-extrabold text-[14.5px] text-[#C5503A]">
                Vincular otro padre
              </span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}