import Link from "next/link";
import { LogoIcon } from "@/app/components/icons";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const destination = typeof next === "string" ? next : "/";

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

          <LoginForm next={destination} />

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