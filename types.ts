// Shared types across components
export interface MenuItem {
  name: string;
  price: string | number;
  description?: string;
  category?: string;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface Deal {
  name: string;
  description: string;
}

export const LANGUAGES = ["English", "Spanish", "French", "German"] as const;
export const VOICES = ["Male", "Female"] as const;
export const ACCENTS = ["US", "UK", "Australian", "Indian"] as const;
export const POS_OPTIONS = ["Square", "Toast", "Clover"] as const;

export type Language = typeof LANGUAGES[number];
export type Voice = typeof VOICES[number];
export type Accent = typeof ACCENTS[number];
export type POSSystem = typeof POS_OPTIONS[number];

export interface SetupForm {
  name: string;
  locations: string[];
  ownerName: string;
  restaurantNumber: string;
  aiNumber: string;
  posSystem: POSSystem | "";
  posApiKey?: string;
  menu: MenuCategory[];
  deals: Deal[];
  language?: Language;
  voice?: Voice;
  accent?: Accent;
}

export interface TextToSpeechResponse {
  message: string;
}