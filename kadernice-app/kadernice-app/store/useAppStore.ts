import { create } from "zustand"
import { Klientka, Rezervace, Poptavka, Sluzba } from "@/types"

const TESTOVACI_KLIENTKY: Klientka[] = [
  {
    id: "1",
    jmeno: "Blanka Nováková",
    telefon: "777 111 222",
    poznamka: "Citlivá pokožka na silný oxidant",
    fotkyVlasu: [],
    navstevy: [
      {
        id: "v1",
        datum: "2026-04-21",
        casOd: "09:00",
        delkaMinut: 90,
        sluzba: "Přeliv",
        cena: 1200,
        zaplaceno: true,
      },
      {
        id: "v2",
        datum: "2026-03-02",
        casOd: "10:00",
        delkaMinut: 150,
        sluzba: "Melír",
        cena: 2100,
        zaplaceno: true,
      },
    ],
  },
  {
    id: "2",
    jmeno: "Alena Tichá",
    telefon: "777 333 444",
    fotkyVlasu: [],
    navstevy: [],
  },
  {
    id: "3",
    jmeno: "Monika Rezková",
    telefon: "777 555 666",
    fotkyVlasu: [],
    navstevy: [],
  },
  {
    id: "4",
    jmeno: "Simona Kučerová",
    telefon: "777 777 888",
    fotkyVlasu: [],
    navstevy: [],
  },
]

const TESTOVACI_REZERVACE: Rezervace[] = [
  {
    id: "r1",
    klientkaId: "3",
    datum: "2026-06-03",
    casOd: "08:00",
    delkaMinut: 60,
    sluzba: "Střih",
    cena: 1200,
    zaplaceno: true,
    stav: "hotovo",
  },
  {
    id: "r2",
    klientkaId: "2",
    datum: "2026-06-03",
    casOd: "09:30",
    delkaMinut: 120,
    sluzba: "Barvení",
    cena: 2400,
    zaplaceno: true,
    stav: "hotovo",
  },
  {
    id: "r3",
    klientkaId: "1",
    datum: "2026-06-03",
    casOd: "13:00",
    delkaMinut: 150,
    sluzba: "Melír",
    cena: 1800,
    zaplaceno: false,
    stav: "probiha",
  },
  {
    id: "r4",
    klientkaId: "4",
    datum: "2026-06-03",
    casOd: "16:00",
    delkaMinut: 60,
    sluzba: "Foukaná",
    cena: 600,
    zaplaceno: false,
    stav: "ceka",
  },
]

const TESTOVACI_POPTAVKY: Poptavka[] = [
  {
    id: "p1",
    jmeno: "Jana Marková",
    telefon: "777 999 000",
    sluzba: "Barvení",
    poznamka: "Hodilo by se pátek nebo sobota odpoledne",
    datum: "2026-06-02",
    stav: "nova",
  },
  {
    id: "p2",
    jmeno: "Petra Horáková",
    telefon: "778 111 222",
    sluzba: "Melír",
    datum: "2026-06-01",
    stav: "nova",
  },
]

interface AppStore {
  klientky: Klientka[]
  rezervace: Rezervace[]
  poptavky: Poptavka[]

  pridatKlientku: (klientka: Omit<Klientka, "id" | "navstevy">) => string
  upravitKlientku: (id: string, data: Partial<Klientka>) => void
  pridatRezervaci: (rezervace: Omit<Rezervace, "id">) => void
  upravitRezervaci: (id: string, data: Partial<Rezervace>) => void
  smazatRezervaci: (id: string) => void
  vyriditPoptavku: (id: string) => void
  odmitnoutPoptavku: (id: string) => void
  vytvorKlientkuZPoptavky: (
    poptavkaId: string,
    datum: string,
    casOd: string,
    delkaMinut: number,
    sluzba: Sluzba
  ) => void
  getRezervaceProDen: (datum: string) => Rezervace[]
  getKlientka: (id: string) => Klientka | undefined
  getDenniTrzba: (datum: string) => number
}

export const useAppStore = create<AppStore>((set, get) => ({
  klientky: TESTOVACI_KLIENTKY,
  rezervace: TESTOVACI_REZERVACE,
  poptavky: TESTOVACI_POPTAVKY,

  pridatKlientku: (data) => {
    const id = crypto.randomUUID()
    set((s) => ({
      klientky: [...s.klientky, { ...data, id, navstevy: [] }],
    }))
    return id
  },

  upravitKlientku: (id, data) =>
    set((s) => ({
      klientky: s.klientky.map((k) => (k.id === id ? { ...k, ...data } : k)),
    })),

  pridatRezervaci: (data) =>
    set((s) => ({
      rezervace: [...s.rezervace, { ...data, id: crypto.randomUUID() }],
    })),

  upravitRezervaci: (id, data) =>
    set((s) => ({
      rezervace: s.rezervace.map((r) => (r.id === id ? { ...r, ...data } : r)),
    })),

  smazatRezervaci: (id) =>
    set((s) => ({
      rezervace: s.rezervace.filter((r) => r.id !== id),
    })),

  vyriditPoptavku: (id) =>
    set((s) => ({
      poptavky: s.poptavky.map((p) =>
        p.id === id ? { ...p, stav: "vyrizena" } : p
      ),
    })),

  odmitnoutPoptavku: (id) =>
    set((s) => ({
      poptavky: s.poptavky.map((p) =>
        p.id === id ? { ...p, stav: "odmitnuta" } : p
      ),
    })),

  vytvorKlientkuZPoptavky: (poptavkaId, datum, casOd, delkaMinut, sluzba) => {
    const poptavka = get().poptavky.find((p) => p.id === poptavkaId)
    if (!poptavka) return
    const klientkaId = get().pridatKlientku({
      jmeno: poptavka.jmeno,
      telefon: poptavka.telefon,
      fotkyVlasu: [],
    })
    get().pridatRezervaci({
      klientkaId,
      datum,
      casOd,
      delkaMinut,
      sluzba,
      zaplaceno: false,
      stav: "ceka",
    })
    get().vyriditPoptavku(poptavkaId)
  },

  getRezervaceProDen: (datum) =>
    get()
      .rezervace.filter((r) => r.datum === datum)
      .sort((a, b) => a.casOd.localeCompare(b.casOd)),

  getKlientka: (id) => get().klientky.find((k) => k.id === id),

  getDenniTrzba: (datum) =>
    get()
      .rezervace.filter((r) => r.datum === datum && r.zaplaceno)
      .reduce((sum, r) => sum + (r.cena ?? 0), 0),
}))
