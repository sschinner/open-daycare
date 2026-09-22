"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Parent, ParentRelation } from "@/data/kids";
import { CloseIcon, InfoIcon, SendIcon } from "./icons";

const RELATIONS: ParentRelation[] = ["Mamá", "Papá", "Tutor/a"];

const AVATAR_PALETTE = [
  "#A9D9E8",
  "#F4B8CC",
  "#B9DEC4",
  "#F4DC8E",
  "#C9B6E8",
  "#A9C7E8",
];

type FieldErrors = { name?: string; email?: string };

type LinkParentModalProps = {
  kidName: string;
  onClose: () => void;
  onSave: (parent: Parent) => void;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function avatarFor(name: string): string {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

const inputBaseClass =
  "w-full bg-white border-[1.5px] rounded-[14px] px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none focus:border-[#F2A78E] transition-colors";

const validInputClass = `${inputBaseClass} border-[#EADFD0]`;
const invalidInputClass = `${inputBaseClass} border-[#D9583C]`;

const labelClass =
  "block text-[12px] font-extrabold tracking-[.7px] text-[#94887B] mb-2";

export function LinkParentModal({ kidName, onClose, onSave }: LinkParentModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState<ParentRelation>("Mamá");
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !EMAIL_PATTERN.test(trimmedEmail)) {
      setErrors({
        ...(trimmedName ? {} : { name: "Ingresá el nombre del padre o de la madre." }),
        ...(EMAIL_PATTERN.test(trimmedEmail)
          ? {}
          : { email: "Ingresá un email válido. Ej: correo@ejemplo.com" }),
      });
      return;
    }

    onSave({
      name: trimmedName,
      email: trimmedEmail,
      initial: trimmedName[0].toUpperCase(),
      avatarBg: avatarFor(trimmedName),
      relation,
      status: "pending",
      statusText: "invitación enviada",
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Vincular padre"
        className="w-full max-w-[480px] bg-[#FBF4EC] border border-[#ECE0D0] rounded-[24px] overflow-hidden shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between px-[26px] py-5 border-b border-[#ECE0D0]">
            <div>
              <div className="font-display font-semibold text-[18px] text-[#3F362E]">
                Vincular padre
              </div>
              <div className="text-[13px] text-[#A89A8B]">a {kidName}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="w-[34px] h-[34px] rounded-[10px] bg-[#F0E6D8] text-[#94887B] flex items-center justify-center"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="px-[26px] py-[22px]">
            <div className="flex gap-[11px] bg-[#E3ECFB] rounded-[14px] px-4 py-[13px] mb-5">
              <span className="flex p-0 mt-[1px] text-[#4E72C8]">
                <InfoIcon />
              </span>
              <span className="text-[13.5px] text-[#3F5694] leading-[1.45]">
                Le enviaremos un correo con un código para que active su cuenta.
                Solo verá el feed de {kidName}.
              </span>
            </div>

            <div className="mb-[18px]">
              <label htmlFor="parent-name" className={labelClass}>
                NOMBRE DEL PADRE/MADRE
              </label>
              <input
                id="parent-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Ej. Diego Fernández"
                className={errors.name ? invalidInputClass : validInputClass}
              />
              {errors.name && (
                <p className="mt-[6px] text-[12px] font-bold text-[#D9583C]">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="mb-[18px]">
              <label htmlFor="parent-email" className={labelClass}>
                EMAIL
              </label>
              <input
                id="parent-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="correo@ejemplo.com"
                className={errors.email ? invalidInputClass : validInputClass}
              />
              {errors.email && (
                <p className="mt-[6px] text-[12px] font-bold text-[#D9583C]">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="mb-5">
              <span className={labelClass}>PARENTESCO</span>
              <div className="flex gap-[9px]">
                {RELATIONS.map((option) => {
                  const isActive = option === relation;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRelation(option)}
                      className={`flex-1 py-[11px] rounded-full border-[1.5px] font-extrabold text-[14px] transition-colors ${
                        isActive
                          ? "bg-[#CCD8F4] border-[#9FB8EC] text-[#4E72C8]"
                          : "bg-[#FFFDF9] border-[#ECE0D0] text-[#6E6359]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#FBF1D6] border-[1.5px] border-dashed border-[#E6D08A] rounded-2xl px-[18px] py-[18px] text-center mb-5">
              <div className="text-[12px] font-extrabold tracking-[.7px] text-[#A88526] mb-2">
                CÓDIGO DE INVITACIÓN
              </div>
              <div className="font-display font-semibold text-[34px] tracking-[7px] text-[#8A7234]">
                7K4P9
              </div>
              <div className="text-[13px] text-[#A88526] mt-[6px]">Vence en 7 días</div>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-[9px] w-full p-[14px] rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] text-white font-extrabold text-[15.5px] shadow-[0_10px_22px_-8px_rgba(238,129,100,.7)]"
            >
              <SendIcon className="text-white" />
              Enviar invitación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}