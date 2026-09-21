import { user, room } from "@/data/mock";
import {
  AccountIcon,
  BellIcon,
  HomeIcon,
  LogoIcon,
  LogoutIcon,
  PlusIcon,
  UsersIcon,
} from "./icons";

type SidebarActive = "feed" | "kids";

const navItems: { label: string; icon: typeof HomeIcon; href: string; key: string }[] = [
  { label: "Feed", icon: HomeIcon, href: "/", key: "feed" },
  { label: "Niños", icon: UsersIcon, href: "/kids", key: "kids" },
  { label: "Avisos", icon: BellIcon, href: "#", key: "avisos" },
  { label: "Mi cuenta", icon: AccountIcon, href: "#", key: "account" },
];

export function Sidebar({ active }: { active: SidebarActive }) {
  return (
    <aside className="hidden lg:flex w-[248px] flex-none flex-col bg-[#FFFDF9] border-r border-[#ECE0D0] py-6 px-4 sticky top-0 h-screen">
      <a href="#" className="flex items-center gap-[11px] px-2 pt-1 pb-[22px]">
        <div className="w-[38px] h-[38px] rounded-xl bg-[linear-gradient(155deg,#F8C3A8,#F2937A)] flex items-center justify-center flex-none">
          <LogoIcon className="text-white" />
        </div>
        <div>
          <div className="font-display font-semibold text-[17px] text-[#3F362E] leading-none">
            OpenDayCare
          </div>
          <div className="text-[11.5px] text-[#A89A8B] mt-[2px]">{room.name}</div>
        </div>
      </a>

      <a
        href="#"
        className="flex items-center justify-center gap-2 w-full p-3 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] text-white font-extrabold text-[14.5px] shadow-[0_8px_18px_-8px_rgba(238,129,100,.75)] mb-[18px]"
      >
        <PlusIcon />
        Nueva publicación
      </a>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ label, icon: Icon, href, key }) => {
          const isActive = key === active;
          return (
            <a
              key={key}
              href={href}
              className={`flex items-center gap-3 px-3 py-[11px] rounded-xl text-[14.5px] ${
                isActive
                  ? "bg-[#FBE3D8] text-[#D9583C] font-extrabold"
                  : "text-[#6E6359] font-semibold"
              }`}
            >
              <Icon />
              {label}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-[#ECE0D0] pt-[14px] mt-[10px]">
        <div className="flex items-center gap-[11px] px-2 py-[6px]">
          <div className="w-[38px] h-[38px] rounded-full bg-[#F2937A] text-white font-display font-semibold text-[16px] flex items-center justify-center flex-none">
            {user.initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-[14px] text-[#3F362E]">
              {user.fullName}
            </div>
            <div className="text-[12px] text-[#A89A8B]">{user.role}</div>
          </div>
          <a
            href="#"
            title="Cerrar sesión"
            className="flex-none w-8 h-8 rounded-[10px] bg-[#F6ECDF] text-[#94887B] flex items-center justify-center"
          >
            <LogoutIcon />
          </a>
        </div>
      </div>
    </aside>
  );
}