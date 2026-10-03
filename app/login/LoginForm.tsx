"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "./actions";

const INITIAL_STATE: { error: string | null } = { error: null };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, INITIAL_STATE);

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="next" value={next} />

      <div className="text-[12px] font-bold tracking-[.7px] text-[#94887B] mb-[8px]">
        EMAIL
      </div>
      <input
        type="email"
        name="email"
        autoComplete="email"
        placeholder="vos@guarderia.com"
        className="w-full px-4 py-[14px] rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] text-[#3F362E] mb-[18px]"
      />
      <div className="text-[12px] font-bold tracking-[.7px] text-[#94887B] mb-[8px]">
        CONTRASEÑA
      </div>
      <input
        type="password"
        name="password"
        autoComplete="current-password"
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

      {state.error && (
        <p
          role="alert"
          className="text-[#C5503A] text-[13.5px] font-bold mb-[14px]"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="block w-full py-[15px] rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] text-white font-extrabold text-[16px] shadow-[0_10px_22px_-8px_rgba(238,129,100,.7)] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Iniciar sesión
      </button>
    </form>
  );
}
