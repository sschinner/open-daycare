"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { rooms } from "@/data/kids";
import type { Kid } from "@/data/kids";
import { ChevronDownIcon } from "./icons";

const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const AVATAR_PALETTE = [
  { avatarBg: "#A9D9E8", avatarText: "#1F7A93" },
  { avatarBg: "#F4B8CC", avatarText: "#C44A7A" },
  { avatarBg: "#B9DEC4", avatarText: "#3E8B62" },
  { avatarBg: "#F4DC8E", avatarText: "#9A7B1E" },
];

type FieldErrors = { name?: string; date?: string };

type AddKidModalProps = {
  onClose: () => void;
  onSave: (kid: Kid) => void;
};

type ParsedDate = { day: number; month: number; year: number };

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function parseDate(value: string): ParsedDate | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(month, year)) return null;
  return { day, month, year };
}

function calculateAge(parsed: ParsedDate): number {
  const today = new Date();
  let age = today.getFullYear() - parsed.year;
  if (
    today.getMonth() + 1 < parsed.month ||
    (today.getMonth() + 1 === parsed.month && today.getDate() < parsed.day)
  ) {
    age -= 1;
  }
  return Math.max(age, 0);
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function avatarFor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

const fieldBaseClass =
  "w-full bg-white border-[1.5px] rounded-[14px] px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none focus:border-[#F2A78E] transition-colors";

const validFieldClass = `${fieldBaseClass} border-[#EADFD0]`;
const invalidFieldClass = `${fieldBaseClass} border-[#D9583C]`;

export function AddKidModal({ onClose, onSave }: AddKidModalProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [roomId, setRoomId] = useState(rooms[0].slug);
  const [allergies, setAllergies] = useState("");
  const [notes, setNotes] = useState("");
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
    const parsedDate = parseDate(date);

    if (!trimmedName || !parsedDate) {
      setErrors({
        ...(trimmedName ? {} : { name: "Ingresá el nombre completo." }),
        ...(parsedDate ? {} : { date: "Fecha inválida. Usá el formato dd/mm/aaaa." }),
      });
      return;
    }

    const palette = avatarFor(trimmedName);
    onSave({
      slug: toSlug(trimmedName),
      name: trimmedName,
      initial: trimmedName[0].toUpperCase(),
      avatarBg: palette.avatarBg,
      avatarText: palette.avatarText,
      age: calculateAge(parsedDate),
      birthdate: `${parsedDate.day} ${MONTHS[parsedDate.month - 1]} ${parsedDate.year}`,
      enrolled: "",
      parents: [],
      room: roomId,
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
        aria-label="Agregar niño"
        className="w-full max-w-[520px] bg-[#FBF4EC] border border-[#ECE0D0] rounded-[24px] overflow-hidden shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between px-[26px] py-5 border-b border-[#ECE0D0]">
            <button
              type="button"
              onClick={onClose}
              className="text-[15px] font-bold text-[#94887B]"
            >
              Cancelar
            </button>
            <span className="font-display font-semibold text-[18px] text-[#3F362E]">
              Agregar niño
            </span>
            <button type="submit" className="text-[15px] font-extrabold text-[#D9583C]">
              Guardar
            </button>
          </div>

          <div className="px-[26px] py-6">
            <div className="mb-[18px]">
              <label
                htmlFor="kid-name"
                className="block text-[12px] font-extrabold tracking-[.7px] text-[#94887B] mb-2"
              >
                NOMBRE COMPLETO
              </label>
              <input
                id="kid-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (errors.name)
                    setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Ej. Martina López"
                className={errors.name ? invalidFieldClass : validFieldClass}
              />
              {errors.name && (
                <p className="mt-[6px] text-[12px] font-bold text-[#D9583C]">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="flex gap-[14px] mb-[18px]">
              <div className="flex-1">
                <label
                  htmlFor="kid-birthdate"
                  className="block text-[12px] font-extrabold tracking-[.7px] text-[#94887B] mb-2"
                >
                  FECHA DE NACIMIENTO
                </label>
                <input
                  id="kid-birthdate"
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value);
                    if (errors.date)
                      setErrors((prev) => ({ ...prev, date: undefined }));
                  }}
                  placeholder="dd/mm/aaaa"
                  className={errors.date ? invalidFieldClass : validFieldClass}
                />
                {errors.date && (
                  <p className="mt-[6px] text-[12px] font-bold text-[#D9583C]">
                    {errors.date}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="kid-room"
                  className="block text-[12px] font-extrabold tracking-[.7px] text-[#94887B] mb-2"
                >
                  SALA
                </label>
                <div className="relative">
                  <select
                    id="kid-room"
                    value={roomId}
                    onChange={(event) => setRoomId(event.target.value)}
                    className="w-full appearance-none bg-white border-[1.5px] border-[#EADFD0] rounded-[14px] px-4 py-[13px] text-[15px] font-bold text-[#3F362E] focus:outline-none focus:border-[#F2A78E] cursor-pointer"
                  >
                    {rooms.map((room) => (
                      <option key={room.slug} value={room.slug}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#B0A290]" />
                </div>
              </div>
            </div>

            <div className="mb-[18px]">
              <label
                htmlFor="kid-allergies"
                className="block text-[12px] font-extrabold tracking-[.7px] text-[#94887B] mb-2"
              >
                ALERGIAS (ETIQUETAS)
              </label>
              <input
                id="kid-allergies"
                value={allergies}
                onChange={(event) => setAllergies(event.target.value)}
                placeholder="Ej. Maní, Lactosa"
                className={validFieldClass}
              />
            </div>

            <div>
              <label
                htmlFor="kid-notes"
                className="block text-[12px] font-extrabold tracking-[.7px] text-[#94887B] mb-2"
              >
                NOTAS MÉDICAS
              </label>
              <textarea
                id="kid-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Indicaciones, medicación, contactos…"
                className="w-full min-h-[90px] resize-y leading-[1.5] bg-white border-[1.5px] border-[#EADFD0] rounded-[14px] px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none focus:border-[#F2A78E] transition-colors"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}