import Link from "next/link";
import { LogoIcon } from "@/app/components/icons";

export default function ActivateAccountPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF4EC] p-10">
      <div className="w-full max-w-[440px]">
        <div className="w-[58px] h-[58px] rounded-[18px] bg-[linear-gradient(155deg,#F8C3A8,#F2937A)] flex items-center justify-center mb-[22px] shadow-[0_12px_26px_-10px_rgba(238,129,100,.65)]">
          <LogoIcon className="w-[30px] h-[30px] text-white" />
        </div>
        <h1 className="font-display font-semibold text-[32px] leading-[1.15] mt-0 mb-[8px] text-[#3F362E]">
          Bienvenida a OpenDayCare
        </h1>
        <p className="mt-0 mb-[26px] text-[#94887B] text-[15.5px] leading-[1.55]">
          Te invitaron a seguir el día de tu hijo. Creá tu contraseña para
          activar la cuenta.
        </p>

        <div className="flex items-center gap-[14px] bg-white border-[1.5px] border-[#EADFD0] rounded-[16px] px-4 py-[14px] mb-[22px]">
          <div className="w-[44px] h-[44px] rounded-full bg-[#A9D9E8] text-[#1F7A93] font-display font-semibold text-[19px] flex items-center justify-center flex-none">
            M
          </div>
          <div>
            <div className="text-[13px] text-[#94887B]">
              Te invitaron a seguir a
            </div>
            <div className="font-display font-semibold text-[17px] text-[#3F362E]">
              Mateo · Sala Soles
            </div>
          </div>
        </div>

        <div className="text-[12px] font-bold tracking-[.7px] text-[#94887B] mb-[8px]">
          CÓDIGO DE INVITACIÓN
        </div>
        <input
          defaultValue="7K4P9"
          className="font-display w-full px-4 py-[14px] rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[18px] font-bold tracking-[3px] text-[#3F362E] mb-[18px]"
        />
        <div className="text-[12px] font-bold tracking-[.7px] text-[#94887B] mb-[8px]">
          EMAIL
        </div>
        <input
          type="email"
          defaultValue="lucia.fernandez@gmail.com"
          className="w-full px-4 py-[14px] rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] text-[#3F362E] mb-[18px]"
        />
        <div className="text-[12px] font-bold tracking-[.7px] text-[#94887B] mb-[8px]">
          CREAR CONTRASEÑA
        </div>
        <input
          type="password"
          defaultValue="contraseña"
          className="w-full px-4 py-[14px] rounded-[14px] border-[1.5px] border-[#F2A78E] bg-white text-[15px] text-[#3F362E] mb-[18px]"
        />

        <div className="flex items-start gap-[12px] bg-[#FBF1D6] rounded-[14px] py-[14px] px-4 mb-6">
          <span className="flex-none w-6 h-6 rounded-[8px] bg-[#5FB97E] flex items-center justify-center mt-[1px]">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="text-[14px] text-[#8A7234] leading-[1.45]">
            Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro
            de la app.
          </span>
        </div>

        <Link
          href="/"
          className="block text-center w-full py-[15px] rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] text-white font-extrabold text-[16px] shadow-[0_10px_22px_-8px_rgba(238,129,100,.7)]"
        >
          Activar mi cuenta
        </Link>
        <p className="text-center mt-[22px] mb-0 text-[#94887B] text-[14.5px]">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-[#C5503A] font-extrabold">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}