import { create } from "zustand"
import { Klientka, Rezervace, Poptavka, Sluzba } from "@/types"
import { supabase } from "@/lib/supabase"

interface AppStore {
  klientky: Klientka[]
  rezervace: Rezervace[]
  poptavky: Poptavka[]
  nacitani: boolean

  // Nacitani dat ze Supabase
  nacistVse: () => Promise<void>

  // Klientky
  pridatKlientku: (data: Omit<Klientka, "id" | "navstevy">) => Promise<string>
  upravitKlientku: (id: string, data: Partial<Klientka>) => Promise<void>
  smazatKlientku: (id: string) => Promise<void>

  // Rezervace
  pridatRezervaci: (data: Omit<Rezervace, "id">) => Promise<void>
  upravitRezervaci: (id: string, data: Partial<Rezervace>) => Promise<void>
  smazatRezervaci: (id: string) => Promise<void>

  // Poptavky
  pridatPoptavku: (data: Omit<Poptavka, "id">) => Promise<void>
  vyriditPoptavku: (id: string) => Promise<void>
  odmitnoutPoptavku: (id: string) => Promise<void>
  vytvorKlientkuZPoptavky: (poptavkaId: string) => Promise<string>

  // Helpery (lokalni)
  getRezervaceProDen: (datum: string) => Rezervace[]
  getKlientka: (id: string) => Klientka | undefined
  getDenniTrzba: (datum: string) => number
}

export const useAppStore = create<AppStore>((set, get) => ({
  klientky: [],
  rezervace: [],
  poptavky: [],
  nacitani: false,

  nacistVse: async () => {
    set({ nacitani: true })
    try {
      const [{ data: klientkyData }, { data: rezervaceData }, { data: poptavkyData }] = await Promise.all([
        supabase.from("klientky").select("*").order("jmeno"),
        supabase.from("rezervace").select("*").order("datum").order("cas_od"),
        supabase.from("poptavky").select("*").order("created_at", { ascending: false }),
      ])

      // Mapovani z DB formatu na app format
      const klientky: Klientka[] = (klientkyData ?? []).map((k: any) => ({
        id: k.id,
        jmeno: k.jmeno,
        telefon: k.telefon ?? "",
        poznamka: k.poznamka ?? undefined,
        fotkyVlasu: [],
        navstevy: [],
      }))

      const rezervace: Rezervace[] = (rezervaceData ?? []).map((r: any) => ({
        id: r.id,
        klientkaId: r.klientka_id,
        datum: r.datum,
        casOd: r.cas_od,
        delkaMinut: r.delka_minut,
        sluzba: r.sluzba as Sluzba,
        cena: r.cena ?? undefined,
        zaplaceno: r.zaplaceno,
        stav: r.stav as "ceka" | "probiha" | "hotovo",
        fotoVlasu: r.foto_vlasy ?? undefined,
        fotoReceptu: r.foto_receptu ?? undefined,
      }))

      const poptavky: Poptavka[] = (poptavkyData ?? []).map((p: any) => ({
        id: p.id,
        jmeno: p.jmeno,
        telefon: p.telefon ?? "",
        sluzba: p.sluzba,
        poznamka: p.poznamka ?? undefined,
        fotoVlasu: p.foto_vlasy ?? undefined,
        fotoInspirace: p.foto_inspirace ?? undefined,
        datum: p.datum,
        stav: p.stav as "nova" | "vyrizena" | "odmitnuta",
      }))

      set({ klientky, rezervace, poptavky, nacitani: false })
    } catch (e) {
      console.error("Chyba pri nacitani dat:", e)
      set({ nacitani: false })
    }
  },

  pridatKlientku: async (data) => {
    const { data: result, error } = await supabase
      .from("klientky")
      .insert({ jmeno: data.jmeno, telefon: data.telefon, poznamka: data.poznamka })
      .select()
      .single()
    if (error || !result) throw error
    const nova: Klientka = { id: result.id, jmeno: result.jmeno, telefon: result.telefon ?? "", poznamka: result.poznamka ?? undefined, fotkyVlasu: [], navstevy: [] }
    set((s) => ({ klientky: [...s.klientky, nova].sort((a, b) => a.jmeno.localeCompare(b.jmeno, "cs")) }))
    return result.id
  },

  upravitKlientku: async (id, data) => {
    const dbData: any = {}
    if (data.jmeno !== undefined) dbData.jmeno = data.jmeno
    if (data.telefon !== undefined) dbData.telefon = data.telefon
    if (data.poznamka !== undefined) dbData.poznamka = data.poznamka
    await supabase.from("klientky").update(dbData).eq("id", id)
    set((s) => ({ klientky: s.klientky.map((k) => k.id === id ? { ...k, ...data } : k) }))
  },

  smazatKlientku: async (id) => {
    await supabase.from("klientky").delete().eq("id", id)
    set((s) => ({
      klientky: s.klientky.filter((k) => k.id !== id),
      rezervace: s.rezervace.filter((r) => r.klientkaId !== id),
    }))
  },

  pridatRezervaci: async (data) => {
    const { data: result, error } = await supabase
      .from("rezervace")
      .insert({
        klientka_id: data.klientkaId,
        datum: data.datum,
        cas_od: data.casOd,
        delka_minut: data.delkaMinut,
        sluzba: data.sluzba,
        cena: data.cena ?? null,
        zaplaceno: data.zaplaceno,
        stav: data.stav,
      })
      .select()
      .single()
    if (error || !result) throw error
    const nova: Rezervace = {
      id: result.id,
      klientkaId: result.klientka_id,
      datum: result.datum,
      casOd: result.cas_od,
      delkaMinut: result.delka_minut,
      sluzba: result.sluzba,
      cena: result.cena ?? undefined,
      zaplaceno: result.zaplaceno,
      stav: result.stav,
    }
    set((s) => ({ rezervace: [...s.rezervace, nova] }))
  },

  upravitRezervaci: async (id, data) => {
    const dbData: any = {}
    if (data.casOd !== undefined) dbData.cas_od = data.casOd
    if (data.delkaMinut !== undefined) dbData.delka_minut = data.delkaMinut
    if (data.sluzba !== undefined) dbData.sluzba = data.sluzba
    if (data.cena !== undefined) dbData.cena = data.cena
    if (data.zaplaceno !== undefined) dbData.zaplaceno = data.zaplaceno
    if (data.stav !== undefined) dbData.stav = data.stav
    if (data.fotoVlasu !== undefined) dbData.foto_vlasy = data.fotoVlasu
    if (data.fotoReceptu !== undefined) dbData.foto_receptu = data.fotoReceptu
    await supabase.from("rezervace").update(dbData).eq("id", id)
    set((s) => ({ rezervace: s.rezervace.map((r) => r.id === id ? { ...r, ...data } : r) }))
  },

  smazatRezervaci: async (id) => {
    await supabase.from("rezervace").delete().eq("id", id)
    set((s) => ({ rezervace: s.rezervace.filter((r) => r.id !== id) }))
  },

  pridatPoptavku: async (data) => {
    const { data: result, error } = await supabase
      .from("poptavky")
      .insert({ jmeno: data.jmeno, telefon: data.telefon, sluzba: data.sluzba, poznamka: data.poznamka, datum: data.datum, stav: "nova" })
      .select()
      .single()
    if (error || !result) throw error
    const nova: Poptavka = { id: result.id, jmeno: result.jmeno, telefon: result.telefon ?? "", sluzba: result.sluzba, poznamka: result.poznamka ?? undefined, datum: result.datum, stav: "nova" }
    set((s) => ({ poptavky: [nova, ...s.poptavky] }))
  },

  vyriditPoptavku: async (id) => {
    await supabase.from("poptavky").update({ stav: "vyrizena" }).eq("id", id)
    set((s) => ({ poptavky: s.poptavky.map((p) => p.id === id ? { ...p, stav: "vyrizena" } : p) }))
  },

  odmitnoutPoptavku: async (id) => {
    await supabase.from("poptavky").update({ stav: "odmitnuta" }).eq("id", id)
    set((s) => ({ poptavky: s.poptavky.map((p) => p.id === id ? { ...p, stav: "odmitnuta" } : p) }))
  },

  vytvorKlientkuZPoptavky: async (poptavkaId) => {
    const poptavka = get().poptavky.find((p) => p.id === poptavkaId)
    if (!poptavka) throw new Error("Poptavka nenalezena")
    const id = await get().pridatKlientku({ jmeno: poptavka.jmeno, telefon: poptavka.telefon, fotkyVlasu: [] })
    await get().vyriditPoptavku(poptavkaId)
    return id
  },

  getRezervaceProDen: (datum) =>
    get().rezervace.filter((r) => r.datum === datum).sort((a, b) => a.casOd.localeCompare(b.casOd)),

  getKlientka: (id) => get().klientky.find((k) => k.id === id),

  getDenniTrzba: (datum) =>
    get().rezervace.filter((r) => r.datum === datum && r.zaplaceno).reduce((sum, r) => sum + (r.cena ?? 0), 0),
}))
