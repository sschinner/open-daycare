export type ParentRelation = "Mamá" | "Papá" | "Tutor/a";

export interface Parent {
  name: string;
  email?: string;
  initial: string;
  avatarBg: string;
  relation: ParentRelation;
  status: "active" | "pending";
  statusText: "activa" | "invitación enviada";
}

export type Allergy = {
  label: "peanut" | "lactose";
  note: string;
};

export interface Room {
  slug: string;
  name: string;
}

export const rooms: Room[] = [
  { slug: "soles", name: "Sala Soles" },
  { slug: "lunas", name: "Sala Lunas" },
  { slug: "estrellas", name: "Sala Estrellas" },
  { slug: "nubes", name: "Sala Nubes" },
];

export interface Kid {
  slug: string;
  name: string;
  initial: string;
  avatarBg: string;
  avatarText: string;
  age: number;
  birthdate: string;
  enrolled: string;
  allergy?: Allergy;
  parents: Parent[];
  room?: string;
}

export const kids: Kid[] = [
  {
    slug: "mateo-fernandez",
    name: "Mateo Fernández",
    initial: "M",
    avatarBg: "#A9D9E8",
    avatarText: "#1F7A93",
    age: 3,
    birthdate: "12 mar 2022",
    enrolled: "feb 2025",
    allergy: {
      label: "peanut",
      note: "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
    },
    parents: [
      {
        name: "Lucía Fernández",
        initial: "L",
        avatarBg: "#C9B6E8",
        relation: "Mamá",
        status: "active",
        statusText: "activa",
      },
      {
        name: "Diego Fernández",
        initial: "D",
        avatarBg: "#A9C7E8",
        relation: "Papá",
        status: "pending",
        statusText: "invitación enviada",
      },
    ],
  },
  {
    slug: "sofia-mendez",
    name: "Sofía Méndez",
    initial: "S",
    avatarBg: "#F4B8CC",
    avatarText: "#C44A7A",
    age: 2,
    birthdate: "8 oct 2023",
    enrolled: "abr 2025",
    parents: [
      {
        name: "Julia Méndez",
        initial: "J",
        avatarBg: "#C9B6E8",
        relation: "Mamá",
        status: "active",
        statusText: "activa",
      },
    ],
  },
  {
    slug: "benjamin-ruiz",
    name: "Benjamín Ruiz",
    initial: "B",
    avatarBg: "#B9DEC4",
    avatarText: "#3E8B62",
    age: 3,
    birthdate: "20 jul 2022",
    enrolled: "mar 2025",
    parents: [
      {
        name: "Camila Ruiz",
        initial: "C",
        avatarBg: "#F4B8CC",
        relation: "Mamá",
        status: "active",
        statusText: "activa",
      },
      {
        name: "Martín Ruiz",
        initial: "M",
        avatarBg: "#A9C7E8",
        relation: "Papá",
        status: "active",
        statusText: "activa",
      },
    ],
  },
  {
    slug: "valentina-soto",
    name: "Valentina Soto",
    initial: "V",
    avatarBg: "#F4DC8E",
    avatarText: "#9A7B1E",
    age: 2,
    birthdate: "3 dic 2023",
    enrolled: "may 2025",
    parents: [],
  },
  {
    slug: "tomas-diaz",
    name: "Tomás Díaz",
    initial: "T",
    avatarBg: "#C9B6E8",
    avatarText: "#7B5FC0",
    age: 3,
    birthdate: "15 ene 2022",
    enrolled: "feb 2025",
    allergy: {
      label: "lactose",
      note: "Intolerancia a la lactosa. Preferir lácteos sin lactosa o alternativas vegetales.",
    },
    parents: [
      {
        name: "Paula Díaz",
        initial: "P",
        avatarBg: "#F4B8CC",
        relation: "Mamá",
        status: "active",
        statusText: "activa",
      },
    ],
  },
  {
    slug: "emma-castro",
    name: "Emma Castro",
    initial: "E",
    avatarBg: "#F4B8CC",
    avatarText: "#C44A7A",
    age: 2,
    birthdate: "22 jun 2023",
    enrolled: "abr 2025",
    parents: [
      {
        name: "Ángeles Castro",
        initial: "A",
        avatarBg: "#C9B6E8",
        relation: "Mamá",
        status: "active",
        statusText: "activa",
      },
    ],
  },
  {
    slug: "lucas-romero",
    name: "Lucas Romero",
    initial: "L",
    avatarBg: "#A9D9E8",
    avatarText: "#1F7A93",
    age: 3,
    birthdate: "5 nov 2021",
    enrolled: "ene 2025",
    parents: [
      {
        name: "Rocío Romero",
        initial: "R",
        avatarBg: "#F4B8CC",
        relation: "Mamá",
        status: "active",
        statusText: "activa",
      },
    ],
  },
  {
    slug: "olivia-vega",
    name: "Olivia Vega",
    initial: "O",
    avatarBg: "#B9DEC4",
    avatarText: "#3E8B62",
    age: 2,
    birthdate: "14 feb 2023",
    enrolled: "mar 2025",
    parents: [
      {
        name: "Nahuel Vega",
        initial: "N",
        avatarBg: "#A9C7E8",
        relation: "Papá",
        status: "active",
        statusText: "activa",
      },
    ],
  },
];

export function getKidBySlug(slug: string): Kid | undefined {
  return kids.find((kid) => kid.slug === slug);
}