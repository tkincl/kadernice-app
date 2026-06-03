"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"
import { Sluzba } from "@/types"

const SLUZBY: Sluzba[] = ["Střih", "Barvení", "Melír", "Foukaná", "Balayage", "Přeliv", "Jiné"]

function formatDatum(d: Date) {
  return d.toISOString().split("T")[0]
}

function getDnyVMesici(rok: number, mesic: number) {
  const dny = []
  const dnes = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(rok, mesic, dnes.getDate() + i)
    dny.push(d)
  }
  return dny
}

const DNY_ZKRATKY = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"]
const MESICE = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"]

function KalendarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const predvyplnenaKlientkaId = searchParams.get("klientkaId")

  const { getRezervaceProDen, getKlientka, klientky, pridatRezervaci } = useAppStore()

  const dnes = new Date(2026, 5, 3)
  const [vybranyDen, setVybranyDen] = useState(formatDatum(dnes))
  const [showNova, setShowNova] = useState(false)
  const [novaKlientkaId, setNovaKlientkaId] = useState(predvyplnenaKlientkaId ?? "")
  const [novaSluzba, setNovaSluzba] = useState<Sluzba>("Střih")
  const [novaCas, setNovaCas] = useState("09:00")
  const [novaDelka, setNovaDelka] = useState(60)

  const dnyVStripu = getDnyVMesici(dnes.getFullYear(), dnes.getMonth())
  const rezervaceDnes = getRezervaceProDen(vybranyDen).sort((a, b) => a.casOd.localeCompare(b.casOd))

  const handleUlozit = () => {
    if (!novaKlientkaId) return
    pridatRezervaci({
      klientkaId: novaKlientkaId,
      datum: vybranyDen,
      casOd: novaCas,
      delkaMinut: novaDelka,
      sluzba: novaSluzba,
      zaplaceno: false,
      stav: "ceka",
    })
    setShowNova(false)
  }

  const vybranyDenObj = new Date(vybranyDen + "T12:00:00")

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-5 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-medium text-gray-900">
            {MESICE[vybranyDenObj.getMonth()]} {vybranyDenObj.getFullYear()}
          </h1>
        </div>

        {/* Strip dnů */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {dnyVStripu.map((d) => {
            const key = formatDatum(d)
            const jeDnes = key === formatDatum(dnes)
            const jeVybrane = key === vybranyDen
            const maRezervace = getRezervaceProDen(key).length > 0
            return (
              <button
                key={key}
                onClick={() => setVybranyDen(key)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border flex-shrink-0 min-w-[46px] transition-colors ${
                  jeDnes
                    ? "bg-emerald-500 border-emerald-500"
                    : jeVybrane
                    ? "border-emerald-400 bg-white"
                    : "border-gray-100 bg-white"
                }`}
              >
                <span className={`text-[10px] ${jeDnes ? "text-emerald-100" : "text-gray-400"}`}>
                  {DNY_ZKRATKY[d.getDay()]}
                </span>
                <span className={`text-sm font-medium ${jeDnes ? "text-white" : jeVybrane ? "text-emerald-600" : "text-gray-800"}`}>
                  {d.getDate()}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full ${maRezervace ? (jeDnes ? "bg-emerald-200" : "bg-emerald-400") : "bg-transparent"}`} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          {vybranyDenObj.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })}
        </p>

        {rezervaceDnes.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm mb-3">Žádné rezervace</p>
            <button
              onClick={() => setShowNova(true)}
              className="text-emerald-600 text-sm font-medium"
            >
              + Přidat rezervaci
            </button>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          {rezervaceDnes.map((r) => {
            const klientka = getKlientka(r.klientkaId)
            const aktivni = r.stav === "probiha"
            const hotovo = r.stav === "hotovo"
            return (
              <button
                key={r.id}
                onClick={() => router.push(`/klientky/${r.klientkaId}`)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left active:scale-[0.98] transition-all ${
                  aktivni
                    ? "bg-emerald-500 border-emerald-500"
                    : hotovo
                    ? "bg-gray-50 border-gray-100 opacity-50"
                    : "bg-white border-gray-100"
                }`}
              >
                <div className={`text-xs font-medium w-10 flex-shrink-0 ${aktivni ? "text-emerald-100" : "text-gray-400"}`}>
                  {r.casOd}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${aktivni ? "text-white" : "text-gray-900"}`}>
                    {klientka?.jmeno}
                  </p>
                  <p className={`text-xs ${aktivni ? "text-emerald-100" : "text-gray-400"}`}>
                    {r.sluzba} · {r.delkaMinut >= 60 ? `${Math.floor(r.delkaMinut / 60)} hod${r.delkaMinut % 60 ? ` ${r.delkaMinut % 60} min` : ""}` : `${r.delkaMinut} min`}
                  </p>
                </div>
                <svg width="16" height="16" fill="none" stroke={aktivni ? "white" : "#d1d5db"} strokeWidth="2" viewBox="0 0 24 24">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            )
          })}
        </div>
      </div>

      {/* FAB */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
        <button
          onClick={() => setShowNova(true)}
          className="w-full bg-emerald-500 text-white rounded-xl py-3.5 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Přidat rezervaci na {vybranyDenObj.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" })}
        </button>
      </div>

      {/* Modal nová rezervace */}
      {showNova && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end max-w-md mx-auto">
          <div className="bg-white rounded-t-2xl w-full p-5 max-h-[85vh] overflow-y-auto">
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h2 className="text-base font-medium text-gray-900 mb-1">Nová rezervace</h2>
            <p className="text-xs text-gray-400 mb-4">
              {vybranyDenObj.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })}
            </p>

            {/* Klientka */}
            <div className="mb-3">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Klientka</label>
              <select
                value={novaKlientkaId}
                onChange={(e) => setNovaKlientkaId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none"
              >
                <option value="">Vybrat klientku...</option>
                {klientky.map((k) => (
                  <option key={k.id} value={k.id}>{k.jmeno}</option>
                ))}
              </select>
            </div>

            {/* Služba */}
            <div className="mb-3">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Služba</label>
              <div className="flex flex-wrap gap-2">
                {SLUZBY.map((s) => (
                  <button
                    key={s}
                    onClick={() => setNovaSluzba(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      novaSluzba === s
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-gray-100 text-gray-600 bg-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Čas */}
            <div className="mb-3">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Začátek</label>
              <input
                type="time"
                value={novaCas}
                onChange={(e) => setNovaCas(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none"
              />
            </div>

            {/* Délka */}
            <div className="mb-5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Délka</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNovaDelka(Math.max(30, novaDelka - 30))}
                  className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-600 text-lg font-medium"
                >
                  −
                </button>
                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-2.5 text-sm font-medium text-gray-900 text-center">
                  {novaDelka >= 60
                    ? `${Math.floor(novaDelka / 60)} hod${novaDelka % 60 ? ` ${novaDelka % 60} min` : ""}`
                    : `${novaDelka} min`}
                </div>
                <button
                  onClick={() => setNovaDelka(novaDelka + 30)}
                  className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-600 text-lg font-medium"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowNova(false)}
                className="flex-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-xl py-3 text-sm font-medium"
              >
                Zrušit
              </button>
              <button
                onClick={handleUlozit}
                disabled={!novaKlientkaId}
                className="flex-1 bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40"
              >
                Uložit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function KalendarPage() {
  return (
    <Suspense>
      <KalendarContent />
    </Suspense>
  )
}
