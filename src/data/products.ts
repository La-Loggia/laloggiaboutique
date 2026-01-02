export type Brand =
  | "MOOR"
  | "SaintTropez"
  | "DiLei"
  | "Mela"
  | "Pecatto"
  | "Dixie"
  | "Replay"
  | "RueMadam"
  | "JOTT"
  | "LolaCasademunt";

export interface Product {
  id: string;
  brand: Brand;
  imageUrl: string;
  createdAt: Date;
}

// Mock products - ordered by most recent first
export const products: Product[] = [
  {
    id: "1",
    brand: "MOOR",
    imageUrl: "/placeholder-1.jpg",
    createdAt: new Date("2025-12-15"),
  },
  {
    id: "2",
    brand: "SaintTropez",
    imageUrl: "/placeholder-2.jpg",
    createdAt: new Date("2025-12-14"),
  },
  {
    id: "3",
    brand: "DiLei",
    imageUrl: "/placeholder-3.jpg",
    createdAt: new Date("2025-12-13"),
  },
  {
    id: "4",
    brand: "Mela",
    imageUrl: "/placeholder-4.jpg",
    createdAt: new Date("2025-12-12"),
  },
  {
    id: "5",
    brand: "Pecatto",
    imageUrl: "/placeholder-5.jpg",
    createdAt: new Date("2025-12-11"),
  },
  {
    id: "6",
    brand: "MOOR",
    imageUrl: "/placeholder-6.jpg",
    createdAt: new Date("2025-12-10"),
  },
  {
    id: "7",
    brand: "SaintTropez",
    imageUrl: "/placeholder-7.jpg",
    createdAt: new Date("2025-12-09"),
  },
  {
    id: "8",
    brand: "DiLei",
    imageUrl: "/placeholder-8.jpg",
    createdAt: new Date("2025-12-08"),
  },
  {
    id: "9",
    brand: "Mela",
    imageUrl: "/placeholder-9.jpg",
    createdAt: new Date("2025-12-07"),
  },
  {
    id: "10",
    brand: "Pecatto",
    imageUrl: "/placeholder-10.jpg",
    createdAt: new Date("2025-12-06"),
  },
  {
    id: "11",
    brand: "MOOR",
    imageUrl: "/placeholder-11.jpg",
    createdAt: new Date("2025-12-05"),
  },
  {
    id: "12",
    brand: "SaintTropez",
    imageUrl: "/placeholder-12.jpg",
    createdAt: new Date("2025-12-04"),
  },
];

export const brands: Brand[] = [
  "MOOR",
  "SaintTropez",
  "DiLei",
  "Mela",
  "Pecatto",
  "Dixie",
  "Replay",
  "RueMadam",
  "JOTT",
  "LolaCasademunt",
];

export const getProductsByBrand = (brand: Brand): Product[] => {
  return products.filter((p) => p.brand === brand).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getLatestProducts = (limit?: number): Product[] => {
  const sorted = [...products].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return limit ? sorted.slice(0, limit) : sorted;
};

export const stores = [
  {
    name: "San Juan Playa",
    address: "Av. Historiador Vicente Ramos, Planta 0",
    city: "Centro Comercial Torregolf",
    mapsUrl: "https://maps.app.goo.gl/ynnjzq9io82KDvSv6",
  },
  {
    name: "Campello",
    address: "C. Sant Bartomeu, 41",
    city: "El Campello",
    mapsUrl: "https://maps.app.goo.gl/zXvM5tmkZuZ9iMYS6",
  },
  {
    name: "Altea",
    address: "C. Comte d'Altea, 58",
    city: "Altea",
    mapsUrl: "https://maps.app.goo.gl/V15YQb4jRQ98F1tN6",
  },
];

export const whatsappNumber = "34647763304";
export const whatsappMessage = "Hola, me gustaría más información sobre esta prenda.";
