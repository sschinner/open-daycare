export interface Room {
  name: string;
  kidCount: number;
  dateLabel: string;
}

export interface Author {
  name: string;
  initial?: string;
}

export interface Feedback {
  likes: number;
  comments: number;
}

export type PostKind = "achievement" | "activity" | "announcement";

type PostBase = {
  id: number;
  author: Author;
  kind: PostKind;
  time: string;
  audience: string;
  text: string;
  feedback: Feedback;
};

export type Post =
  | (PostBase & { kind: "achievement" })
  | (PostBase & { kind: "activity"; photoLabel: string })
  | (PostBase & { kind: "announcement" });

export const user = {
  name: "Caro",
  fullName: "Caro Giménez",
  role: "Maestra · Soles",
  initial: "C",
};

export const room: Room = {
  name: "Sala Soles",
  kidCount: 12,
  dateLabel: "martes 17 jun",
};

export const posts: Post[] = [
  {
    id: 1,
    author: { name: "Mateo", initial: "M" },
    kind: "achievement",
    time: "14:20",
    audience: "Para: familia de Mateo",
    text: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    feedback: { likes: 3, comments: 1 },
  },
  {
    id: 2,
    author: { name: "Mateo", initial: "M" },
    kind: "activity",
    time: "09:40",
    audience: "Para: familia de Mateo",
    text: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photoLabel: "Foto · pintando con témperas",
    feedback: { likes: 5, comments: 2 },
  },
  {
    id: 3,
    author: { name: "Anuncio general" },
    kind: "announcement",
    time: "07:50",
    audience: "Para: toda la sala",
    text: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    feedback: { likes: 8, comments: 0 },
  },
];
