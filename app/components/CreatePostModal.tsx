"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { kids } from "@/data/kids";
import { user } from "@/data/mock";
import type { Post, PostKind } from "@/data/mock";
import { CloseIcon, PlusIcon } from "./icons";

const ALL_ROOM = "all";

const MAX_PHOTOS = 4;

type PostTypeOption = {
  label: string;
  kind: PostKind;
  active: string;
  idle: string;
};

const POST_TYPES: PostTypeOption[] = [
  {
    label: "Comida",
    kind: "food",
    active: "bg-[#9A7B1E] text-white",
    idle: "bg-[#9A7B1E] text-white",
  },
  {
    label: "Siesta",
    kind: "nap",
    active: "bg-[#7B5FC0] text-white",
    idle: "bg-[#E7DCF6] text-[#7B5FC0]",
  },
  {
    label: "Actividad",
    kind: "activity",
    active: "bg-[#2E89A6] text-white",
    idle: "bg-[#C7E7F1] text-[#2E89A6]",
  },
  {
    label: "Logro",
    kind: "achievement",
    active: "bg-[#3E9B6C] text-white",
    idle: "bg-[#CFEBD8] text-[#3E9B6C]",
  },
  {
    label: "Ánimo",
    kind: "mood",
    active: "bg-[#C56486] text-white",
    idle: "bg-[#F9D2DE] text-[#C56486]",
  },
  {
    label: "Foto",
    kind: "photo",
    active: "bg-[#D9684A] text-white",
    idle: "bg-[#FBD8CC] text-[#D9684A]",
  },
  {
    label: "Anuncio",
    kind: "announcement",
    active: "bg-[#4E72C8] text-white",
    idle: "bg-[#CCD8F4] text-[#4E72C8]",
  },
];

const selectedPillClass =
  "border-[1.5px] border-[#3F362E] bg-[#3F362E] text-white";
const idlePillClass =
  "border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]";

const sectionLabelClass =
  "block text-[12px] font-extrabold tracking-[.7px] text-[#94887B] mb-[10px]";

const errorTextClass = "mt-[6px] text-[12px] font-bold text-[#D9583C]";

const textareaClass =
  "w-full min-h-[120px] resize-y bg-white border-[1.5px] rounded-[14px] px-4 py-[13px] text-[15px] text-[#3F362E] outline-none transition-colors focus:border-[#F2A78E]";

type FieldErrors = {
  kid?: string;
  type?: string;
  description?: string;
};

type CreatePostModalProps = {
  onClose: () => void;
  onSave: (post: Post) => void;
};

function nowHHMM(): string {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function CreatePostModal({ onClose, onSave }: CreatePostModalProps) {
  const [selectedKid, setSelectedKid] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<PostKind | null>(null);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isDragging, setIsDragging] = useState(false);
  const photoUrlsRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const urls = photoUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function syncPhotos(next: string[]) {
    photoUrlsRef.current = next;
    setPhotos(next);
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const next = [...photos];
    for (const file of Array.from(files).slice(0, remaining)) {
      next.push(URL.createObjectURL(file));
    }
    syncPhotos(next);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files);
    event.target.value = "";
  }

  function removePhoto(url: string) {
    URL.revokeObjectURL(url);
    syncPhotos(photos.filter((photo) => photo !== url));
  }

  function handleDragOver(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!isDragging) setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function resetForm() {
    setSelectedKid(null);
    setSelectedType(null);
    setDescription("");
    photoUrlsRef.current = [];
    setPhotos([]);
    setErrors({});
    setIsDragging(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!selectedKid) nextErrors.kid = "Elegí a quién va dirigida la publicación.";
    if (!selectedType) nextErrors.type = "Elegí un tipo de publicación.";
    if (!description.trim()) nextErrors.description = "Escribí una descripción.";
    if (nextErrors.kid || nextErrors.type || nextErrors.description) {
      setErrors(nextErrors);
      return;
    }

    const selected = kids.find((kid) => kid.slug === selectedKid);
    const audience =
      selectedKid === ALL_ROOM
        ? "Para: toda la sala"
        : `Para: familia de ${selected?.name ?? ""}`;

    const post: Post = {
      id: Date.now(),
      author: { name: user.name, initial: user.initial },
      kind: selectedType as PostKind,
      time: nowHHMM(),
      audience,
      text: description.trim(),
      feedback: { likes: 0, comments: 0 },
      photos: photos.length > 0 ? photos : undefined,
    } as Post;

    resetForm();
    onSave(post);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nueva publicación"
        className="w-full max-w-[580px] bg-[#FBF4EC] border border-[#ECE0D0] rounded-[24px] overflow-hidden shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]"
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
              Nueva publicación
            </span>
            <button
              type="submit"
              className="text-[15px] font-extrabold text-[#D9583C]"
            >
              Publicar
            </button>
          </div>

          <div className="px-[26px] py-6">
            <div className="mb-[22px]">
              <span className={sectionLabelClass}>PARA</span>
              <div className="flex flex-wrap gap-[9px]">
                {kids.map((kid) => {
                  const isSelected = selectedKid === kid.slug;
                  return (
                    <button
                      key={kid.slug}
                      type="button"
                      onClick={() => {
                        setSelectedKid(kid.slug);
                        if (errors.kid)
                          setErrors((prev) => ({ ...prev, kid: undefined }));
                      }}
                      className={`flex items-center gap-2 pl-[6px] pr-[14px] py-[6px] rounded-full font-bold text-[14px] transition-colors ${
                        isSelected ? selectedPillClass : idlePillClass
                      }`}
                    >
                      <span
                        className="w-[26px] h-[26px] rounded-full font-display font-semibold text-[13px] flex items-center justify-center flex-none"
                        style={{
                          backgroundColor: kid.avatarBg,
                          color: kid.avatarText,
                        }}
                      >
                        {kid.initial}
                      </span>
                      {kid.name}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedKid(ALL_ROOM);
                    if (errors.kid)
                      setErrors((prev) => ({ ...prev, kid: undefined }));
                  }}
                  className={`px-[16px] py-[6px] rounded-full font-bold text-[14px] transition-colors ${
                    selectedKid === ALL_ROOM ? selectedPillClass : idlePillClass
                  }`}
                >
                  Toda la sala
                </button>
              </div>
              {errors.kid && <p className={errorTextClass}>{errors.kid}</p>}
            </div>

            <div className="mb-[22px]">
              <span className={sectionLabelClass}>TIPO</span>
              <div className="flex flex-wrap gap-[9px]">
                {POST_TYPES.map((option) => {
                  const isSelected = selectedType === option.kind;
                  return (
                    <button
                      key={option.kind}
                      type="button"
                      onClick={() => {
                        setSelectedType(option.kind);
                        if (errors.type)
                          setErrors((prev) => ({ ...prev, type: undefined }));
                      }}
                      className={`px-[16px] py-2 rounded-full font-extrabold text-[13.5px] transition-colors ${
                        isSelected
                          ? `${option.active} border-[1.5px] border-[#3F362E]`
                          : `${option.idle} border-[1.5px] border-transparent`
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {errors.type && <p className={errorTextClass}>{errors.type}</p>}
            </div>

            <div className="mb-[22px]">
              <label htmlFor="post-description" className={sectionLabelClass}>
                DESCRIPCIÓN
              </label>
              <textarea
                id="post-description"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  if (errors.description)
                    setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                placeholder="Contá cómo le fue hoy…"
                className={`${textareaClass} ${
                  errors.description
                    ? "border-[#D9583C]"
                    : "border-[#EADFD0]"
                }`}
              />
              {errors.description && (
                <p className={errorTextClass}>{errors.description}</p>
              )}
            </div>

            <div>
              <span className={sectionLabelClass}>FOTOS</span>
              <div className="flex gap-3 flex-wrap">
                {photos.map((url) => (
                  <div key={url} className="relative w-[96px] h-[96px]">
                    <img
                      src={url}
                      alt=""
                      className="w-[96px] h-[96px] rounded-[14px] object-cover border border-[#ECE0D0]"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(url)}
                      aria-label="Quitar foto"
                      className="absolute -top-2 -right-2 w-[24px] h-[24px] rounded-full bg-[#3F362E] text-white flex items-center justify-center"
                    >
                      <CloseIcon width={12} height={12} />
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-[96px] h-[96px] rounded-[14px] border-[1.5px] border-dashed flex flex-col items-center justify-center gap-[6px] text-[#B0A290] ${
                      isDragging
                        ? "border-[#C5503A] bg-[#FBE3D8]"
                        : "border-[#DBCDBA] bg-[#F4ECE1]"
                    }`}
                  >
                    <PlusIcon className="text-[#C5503A]" />
                    <span className="text-[12px]">Agregar</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </form>
      </div>
    </div>
  );
}