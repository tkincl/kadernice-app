export type Sluzba =
  | "Střih"
  | "Barvení"
  | "Melír"
  | "Foukaná"
  | "Balayage"
  | "Přeliv"
  | "Jiné"

export interface Klientka {
  id: string
  jmeno: string
  telefon: string
  poznamka?: string
  fotkyVlasu: string[]
  navstevy: Navsteva[]
}

export interface Navsteva {
  id: string
  datum: string
  casOd: string
  delkaMinut: number
  sluzba: Sluzba
  cena?: number
  zaplaceno: boolean
  fotoVlasu?: string
  fotoReceptu?: string
}

export interface Poptavka {
  id: string
  jmeno: string
  telefon: string
  sluzba: string
  poznamka?: string
  fotoVlasu?: string
  fotoInspirace?: string
  datum: string
  stav: "nova" | "vyrizena" | "odmitnuta"
}

export interface Rezervace {
  id: string
  klientkaId: string
  datum: string
  casOd: string
  delkaMinut: number
  sluzba: Sluzba
  cena?: number
  zaplaceno: boolean
  stav: "ceka" | "probiha" | "hotovo"
  fotoVlasu?: string
  fotoReceptu?: string
}
