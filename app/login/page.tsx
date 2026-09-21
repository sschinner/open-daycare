import Link from "next/link";
import { LogoIcon } from "@/app/components/icons";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] bg-[#FBF4EC]">
      <div className="relative overflow-hidden flex flex-col justify-between bg-[linear-gradient(155deg,#F6A98E_0%,#F2937A_45%,#EC7E62_100%)] px-[60px] py-14 text-white">
        <div className="absolute w-[420px] h-[420px] rounded-full bg-[rgba(255,255,255,.12)] -top-[140px] -right-[120px]" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-[rgba(255,255,255,.10)] -bottom-[110px] -left-[80px]" />
        <div className="relative flex items-center gap-[13px]">
          <div className="w-[46px] h-[46px] rounded-[14px] bg-[rgba(255,255,255,.22)] flex items-center justify-center">
            <LogoIcon className="w-[26px] h-[26px] text-white" />
          </div>
          <span className="font-display font-semibold text-[21px] tracking-[.5px]">
            OpenDayCare
          </span>
        </div>
        <div className="relative">
          <h1 className="font-display font-semibold text-[42px] leading-[1.12] mt-0 mb-[18px]">
            El día de cada niño,
            <br />
            compartido con su familia.
          </h1>
          <p className="text-[17px] leading-[1.6] mt-0 mb-0 max-w-[430px] text-[rgba(255,255,255,.92)]">
            Publicá momentos, gestioná las salas y mantené a las familias cerca,
            desde un solo lugar.
          </p>
        </div>
        <div className="relative text-[14px] text-[rgba(255,255,255,.9)]">
          🌿 Guardería Sala Soles
        </div>
      </div>

      <div className="flex items-center justify-center p-10">
        <div className="w-full max-w-[392px]">
          <h2 className="font-display font-semibold text-[30px] mt-0 mb-[6px] text-[#3F362E]">
            Iniciar sesión
          </h2>
          <p className="mt-0 mb-[28px] text-[#94887B] text-[15px]">
            Ingresá para ver el día de hoy.
          </p>

          <div className="text-[12px] font-bold tracking-[.7px] text-[#94887B] mb-[8px]">
            EMAIL
          </div>
          <input
            type="email"
            defaultValue="caro@opendaycare.com"
            className="w-full px-4 py-[14px] rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] text-[#3F362E] mb-[18px]"
          />
          <div className="text-[12px] font-bold tracking-[.7px] text-[#94887B] mb-[8px]">
            CONTRASEÑA
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-[14px] rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] text-[#3F362E] mb-[10px]"
          />
          <div className="text-right mb-5">
            <Link
              href="#"
              className="text-[#C5503A] text-[13.5px] font-bold cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Link
            href="/"
            className="block text-center w-full py-[15px] rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] text-white font-extrabold text-[16px] shadow-[0_10px_22px_-8px_rgba(238,129,100,.7)]"
          >
            Iniciar sesión
          </Link>

          <p className="text-center mt-6 mb-0 text-[#94887B] text-[14.5px]">
            ¿Te invitó la guardería?{" "}
            <Link href="/activate-account" className="text-[#C5503A] font-extrabold">
              Activá tu cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}