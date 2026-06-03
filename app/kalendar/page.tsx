"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"
import { Sluzba } from "@/types"

const SLUZBY: Sluzba[] = ["Střih", "Barvení", "Melír", "Foukaná", "Balayage", "Přeliv", "Jiné"]
const DNY = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"]
const MESICE = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"]

function formatDatum(d: Date) {
  return d.toISOString().split("T")[0]
}

function getDnyMesice(rok: number, mesic: number) {
  const pocet = new Date(rok, mesic + 1, 0).getDate()
  return Array.from({ length: pocet }, (_, i) => new Date(rok, mesic, i + 1))
}

function getVolneSloty(rezervace: any[]) {
  const pracovniDen = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"]
  const obsazene = new Set<string>()
  rezervace.forEach((r) => {
    const [h, m] = r.casOd.split(":").map(Number)
    const startMin = h * 60 + m
    for (let i = 0; i < r.delkaMinut; i += 30) {
      const t = startMin + i
      obsazene.add(`${Math.floor(t/60).toString().padStart(2,"0")}:${(t%60).toString().padStart(2,"0")}`)
    }
  })
  return pracovniDen.filter((c) => !obsazene.has(c))
}

type StavDne = "prazdny" | "volno" | "plno"

function getStavDne(rezervace: any[]): StavDne {
  if (rezervace.length === 0) return "prazdny"
  const volne = getVolneSloty(rezervace)
  return volne.length === 0 ? "plno" : "volno"
}


function formatTelefon(val: string): string {
  // Vzdy jen cislice, max 9
  const cislice = val.replace(/[^0-9]/g, "").slice(0, 9)
  if (cislice.length <= 3) return cislice
  if (cislice.length <= 6) return cislice.slice(0,3) + " " + cislice.slice(3)
  return cislice.slice(0,3) + " " + cislice.slice(3,6) + " " + cislice.slice(6)
}

function validateTelefon(tel: string): string | null {
  const cislice = tel.replace(/[^0-9]/g, "")
  if (cislice.length === 0) return null
  if (cislice.length < 9) return `Zbývá ${9 - cislice.length} číslic`
  return null
}

function TelefonInput({ value, onChange, autoFocus }: {
  value: string
  onChange: (val: string) => void
  autoFocus?: boolean
}) {
  const cislice = value.replace(/[^0-9]/g, "")
  const chyba = validateTelefon(value)
  const jeVyplnene = cislice.length > 0
  const jeHotove = cislice.length === 9

  return (
    <div>
      <div className="relative">
        <input
          type="tel"
          inputMode="numeric"
          placeholder="777 123 456"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(formatTelefon(e.target.value))}
          className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors pr-16 ${
            jeHotove
              ? "border-emerald-300 bg-emerald-50"
              : jeVyplnene
              ? "border-orange-300 bg-orange-50"
              : "bg-gray-50 border-gray-100 focus:border-emerald-300"
          }`}
        />
        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium tabular-nums ${
          jeHotove ? "text-emerald-500" : "text-orange-400"
        }`}>
          {cislice.length}/9
        </span>
      </div>
      {jeVyplnene && !jeHotove && (
        <p className="text-xs text-orange-500 mt-1">{chyba}</p>
      )}
      {jeHotove && (
        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
          V pořádku
        </p>
      )}
    </div>
  )
}

function DenButton({ d, vybranyDen, setVybranyDen, dnes, getRezervaceProDen, onClose }: {
  d: Date, vybranyDen: string, setVybranyDen: (v: string) => void,
  dnes: Date, getRezervaceProDen: (d: string) => any[], onClose?: () => void
}) {
  const key = formatDatum(d)
  const jeDnes = key === formatDatum(dnes)
  const jeVybrane = key === vybranyDen
  const stav = getStavDne(getRezervaceProDen(key))

  const handleClick = () => { setVybranyDen(key); onClose?.() }

  let btnClass = "border-gray-100 bg-white"
  if (jeDnes) btnClass = "bg-emerald-500 border-emerald-500"
  else if (jeVybrane) btnClass = "border-emerald-400 bg-emerald-50"
  else if (stav === "plno") btnClass = "border-red-100 bg-red-50"

  let nameClass = "text-gray-400"
  if (jeDnes) nameClass = "text-emerald-100"
  else if (stav === "plno") nameClass = "text-red-400"

  let numClass = "text-gray-800"
  if (jeDnes) numClass = "text-white"
  else if (jeVybrane) numClass = "text-emerald-600"
  else if (stav === "plno") numClass = "text-red-500"

  return (
    <button onClick={handleClick}
      className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl border flex-1 transition-colors ${btnClass}`}>
      <span className={`text-[10px] ${nameClass}`}>{DNY[d.getDay()]}</span>
      <span className={`text-sm font-medium ${numClass}`}>{d.getDate()}</span>
      {stav === "prazdny" && <div className="w-1.5 h-1.5 rounded-full bg-transparent" />}
      {stav === "volno" && <div className={`w-1.5 h-1.5 rounded-full ${jeDnes ? "bg-emerald-200" : "bg-emerald-400"}`} />}
      {stav === "plno" && <div className="w-1.5 h-1.5 rounded-full bg-red-400" />}
    </button>
  )
}

function MesicDenButton({ d, vybranyDen, setVybranyDen, dnes, getRezervaceProDen, onClose }: {
  d: Date, vybranyDen: string, setVybranyDen: (v: string) => void,
  dnes: Date, getRezervaceProDen: (d: string) => any[], onClose?: () => void
}) {
  const key = formatDatum(d)
  const jeDnes = key === formatDatum(dnes)
  const jeVybrane = key === vybranyDen
  const stav = getStavDne(getRezervaceProDen(key))

  let btnClass = "text-gray-700 hover:bg-gray-200"
  if (jeDnes) btnClass = "bg-emerald-500 text-white"
  else if (jeVybrane) btnClass = "bg-emerald-100 text-emerald-700"
  else if (stav === "plno") btnClass = "bg-red-50 text-red-500"

  return (
    <button onClick={() => { setVybranyDen(key); onClose?.() }}
      className={`relative h-8 rounded-lg text-xs font-medium transition-colors flex flex-col items-center justify-center gap-0.5 ${btnClass}`}>
      {d.getDate()}
      {stav === "volno" && <div className={`w-1 h-1 rounded-full ${jeDnes ? "bg-emerald-200" : "bg-emerald-400"}`} />}
      {stav === "plno" && <div className="w-1 h-1 rounded-full bg-red-400" />}
    </button>
  )
}

function KalendarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const predvyplnenaKlientkaId = searchParams.get("klientkaId")
  const { getRezervaceProDen, getKlientka, klientky, pridatRezervaci, upravitRezervaci, smazatRezervaci, pridatKlientku } = useAppStore()

  const dnes = new Date()
  const [tydneOffset, setTydneOffset] = useState(0)
  const [showMesic, setShowMesic] = useState(false)
  const [vybranyDen, setVybranyDen] = useState(formatDatum(dnes))
  const [showNova, setShowNova] = useState(false)
  const [editRezervaceId, setEditRezervaceId] = useState<string | null>(null)
  const [novaKlientkaId, setNovaKlientkaId] = useState(predvyplnenaKlientkaId ?? "")
  const [showNovyKlient, setShowNovyKlient] = useState(false)
  const [novyJmeno, setNovyJmeno] = useState("")
  const [novyTelefon, setNovyTelefon] = useState("")
  const [hledaniKlientky, setHledaniKlientky] = useState("")
  const [novaSluzba, setNovaSluzba] = useState<Sluzba>("Střih")
  const [novaCas, setNovaCas] = useState("09:00")
  const [novaDelka, setNovaDelka] = useState(60)

  // Tyden - zacina od pondeli
  const zacatekTydne = new Date(dnes)
  const denVTydnu = dnes.getDay()
  const posunNaPondeli = denVTydnu === 0 ? -6 : 1 - denVTydnu
  zacatekTydne.setDate(dnes.getDate() + posunNaPondeli + tydneOffset * 7)

  const dnyTydne = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(zacatekTydne)
    d.setDate(zacatekTydne.getDate() + i)
    return d
  })

  const dnyMesice = getDnyMesice(zacatekTydne.getFullYear(), zacatekTydne.getMonth())
  const rezervaceDnes = getRezervaceProDen(vybranyDen)
  const volneSloty = getVolneSloty(rezervaceDnes)
  const vybranyDenObj = new Date(vybranyDen + "T12:00:00")

  const handleUlozit = () => {
    if (!novaKlientkaId) return
    pridatRezervaci({ klientkaId: novaKlientkaId, datum: vybranyDen, casOd: novaCas, delkaMinut: novaDelka, sluzba: novaSluzba, zaplaceno: false, stav: "ceka" })
    setShowNova(false)
  }

  const handleVytvorKlientku = async () => {
    if (!novyJmeno.trim()) return
    const id = await pridatKlientku({ jmeno: novyJmeno.trim(), telefon: novyTelefon.trim(), fotkyVlasu: [] })
    setNovaKlientkaId(id)
    setNovyJmeno("")
    setNovyTelefon("")
    setShowNovyKlient(false)
  }

  const openNova = (cas?: string) => {
    if (cas) setNovaCas(cas)
    setShowNova(true)
  }

  const vsechnySloty = [
    ...rezervaceDnes.map((r) => ({ typ: "rezervace" as const, cas: r.casOd, data: r })),
    ...volneSloty.filter((cas) => {
      const [h, m] = cas.split(":").map(Number)
      const casMin = h * 60 + m
      return !rezervaceDnes.some((r) => {
        const [rh, rm] = r.casOd.split(":").map(Number)
        const rStart = rh * 60 + rm
        return casMin > rStart && casMin < rStart + r.delkaMinut
      })
    }).map((cas) => ({ typ: "volny" as const, cas, data: null })),
  ].sort((a, b) => a.cas.localeCompare(b.cas))

  const timeline = vsechnySloty.filter((slot, i) => {
    if (slot.typ === "rezervace") return true
    const prev = vsechnySloty[i - 1]
    return !prev || prev.typ === "rezervace"
  })

  const editRezervace = editRezervaceId ? rezervaceDnes.find((x) => x.id === editRezervaceId) : null

  return (
    <div className="flex flex-col" style={{height: "calc(100vh - 80px)"}}>
      <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setTydneOffset(tydneOffset - 1)}
            className="w-8 h-8 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center active:bg-gray-100">
            <svg width="14" height="14" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button onClick={() => setShowMesic(!showMesic)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-base font-medium text-gray-900">
              {MESICE[zacatekTydne.getMonth()]} {zacatekTydne.getFullYear()}
            </span>
            <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
              <path d={showMesic ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"}/>
            </svg>
          </button>
          <button onClick={() => setTydneOffset(tydneOffset + 1)}
            className="w-8 h-8 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center active:bg-gray-100">
            <svg width="14" height="14" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        {showMesic && (
          <div className="bg-gray-50 rounded-xl p-2 mb-2">
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {["Ne","Po","Út","St","Čt","Pá","So"].map((d) => (
                <div key={d} className="text-center text-[10px] text-gray-400 font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {dnyMesice.map((d) => (
                <MesicDenButton key={formatDatum(d)} d={d} vybranyDen={vybranyDen}
                  setVybranyDen={setVybranyDen} dnes={dnes}
                  getRezervaceProDen={getRezervaceProDen}
                  onClose={() => setShowMesic(false)} />
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-1.5">
          {dnyTydne.map((d) => (
            <DenButton key={formatDatum(d)} d={d} vybranyDen={vybranyDen}
              setVybranyDen={setVybranyDen} dnes={dnes}
              getRezervaceProDen={getRezervaceProDen} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          {vybranyDenObj.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        {timeline.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm mb-3">Žádné rezervace</p>
            <button onClick={() => openNova("09:00")} className="text-emerald-600 text-sm font-medium">+ Přidat rezervaci</button>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          {timeline.map((slot) => {
            if (slot.typ === "rezervace") {
              const r = slot.data
              const klientka = getKlientka(r.klientkaId)
              const aktivni = r.stav === "probiha"
              const hotovo = r.stav === "hotovo"
              return (
                <button key={r.id} onClick={() => setEditRezervaceId(r.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left active:scale-[0.98] transition-all ${
                    aktivni ? "bg-emerald-500 border-emerald-500" : hotovo ? "bg-gray-50 border-gray-100 opacity-50" : "bg-white border-gray-100"
                  }`}>
                  <div className={`text-xs font-medium w-10 flex-shrink-0 ${aktivni ? "text-emerald-100" : "text-gray-400"}`}>{r.casOd}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${aktivni ? "text-white" : "text-gray-900"}`}>{klientka?.jmeno}</p>
                    <p className={`text-xs ${aktivni ? "text-emerald-100" : "text-gray-400"}`}>
                      {r.sluzba} · {r.delkaMinut >= 60 ? `${Math.floor(r.delkaMinut/60)} hod${r.delkaMinut%60 ? ` ${r.delkaMinut%60} min` : ""}` : `${r.delkaMinut} min`}
                    </p>
                  </div>
                  <svg width="16" height="16" fill="none" stroke={aktivni ? "white" : "#d1d5db"} strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              )
            } else {
              return (
                <button key={`volny-${slot.cas}`} onClick={() => openNova(slot.cas)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl border border-dashed border-gray-200 text-left hover:border-emerald-300 hover:bg-emerald-50 transition-colors group">
                  <div className="text-xs font-medium w-10 flex-shrink-0 text-gray-300 group-hover:text-emerald-400">{slot.cas}</div>
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" fill="none" stroke="#d1d5db" strokeWidth="2" viewBox="0 0 24 24" className="group-hover:stroke-emerald-400">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span className="text-xs text-gray-300 group-hover:text-emerald-500">Volný slot</span>
                  </div>
                </button>
              )
            }
          })}
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
        <button onClick={() => openNova()}
          className="w-full bg-emerald-500 text-white rounded-xl py-3.5 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Přidat rezervaci na {vybranyDenObj.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" })}
        </button>
      </div>

      {showNova && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end max-w-md mx-auto">
          <div className="bg-white rounded-t-2xl w-full flex flex-col" style={{maxHeight: "calc(100vh - 64px)"}}>
            <div className="flex-shrink-0 px-5 pt-5 pb-3">
              <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <h2 className="text-base font-medium text-gray-900">Nová rezervace</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {vybranyDenObj.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-2">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Klientka</label>
                  <button onClick={() => setShowNovyKlient(!showNovyKlient)}
                    className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                    Nová klientka
                  </button>
                </div>
                {showNovyKlient ? (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1">Jméno *</label>
                      <input autoFocus type="text" placeholder="Jana Nováková" value={novyJmeno}
                        onChange={(e) => setNovyJmeno(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-300"/>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1">Telefon</label>
                      <TelefonInput value={novyTelefon} onChange={setNovyTelefon} />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => { setShowNovyKlient(false); setNovyJmeno(""); setNovyTelefon("") }}
                        className="flex-1 bg-white border border-gray-100 text-gray-600 rounded-xl py-2.5 text-sm font-medium">Zrušit</button>
                      <button onClick={handleVytvorKlientku}
                        disabled={!novyJmeno.trim() || (novyTelefon.length > 0 && validateTelefon(novyTelefon) !== null)}
                        className="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-40">Vytvořit</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 mb-1">
                      <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                      </svg>
                      <input type="text" placeholder="Hledat klientku..."
                        value={hledaniKlientky}
                        onChange={(e) => setHledaniKlientky(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"/>
                      {hledaniKlientky && (
                        <button onClick={() => setHledaniKlientky("")} className="text-gray-400">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>
                      )}
                    </div>
                    {(() => {
                      const filtrovane = klientky.filter((k) =>
                        k.jmeno.toLowerCase().includes(hledaniKlientky.toLowerCase()) ||
                        k.telefon?.includes(hledaniKlientky)
                      )
                      return (
                        <div className="max-h-36 overflow-y-auto rounded-xl border border-gray-100 bg-white">
                          {filtrovane.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-3">Nenalezena</p>
                          )}
                          {filtrovane.map((k) => (
                            <button key={k.id} onClick={() => { setNovaKlientkaId(k.id); setHledaniKlientky("") }}
                              className={`w-full flex items-center gap-2 px-3 py-2.5 text-left border-b border-gray-50 last:border-0 transition-colors ${novaKlientkaId === k.id ? "bg-emerald-50" : "hover:bg-gray-50"}`}>
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-medium text-blue-700 flex-shrink-0">
                                {k.jmeno.split(" ").map((s: string) => s[0]).join("").toUpperCase().slice(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${novaKlientkaId === k.id ? "text-emerald-700" : "text-gray-900"}`}>{k.jmeno}</p>
                                {k.telefon && <p className="text-xs text-gray-400">{k.telefon}</p>}
                              </div>
                              {novaKlientkaId === k.id && (
                                <svg width="14" height="14" fill="none" stroke="#059669" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                )}
                {novaKlientkaId && !showNovyKlient && (
                  <p className="text-xs text-emerald-600 mt-1 font-medium">
                    ✓ {klientky.find(k => k.id === novaKlientkaId)?.jmeno}
                  </p>
                )}
              </div>
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Služba</label>
                <div className="flex flex-wrap gap-2">
                  {SLUZBY.map((s) => (
                    <button key={s} onClick={() => setNovaSluzba(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${novaSluzba === s ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-100 text-gray-600 bg-white"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Čas začátku</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"].map((c) => (
                    <button key={c} onClick={() => setNovaCas(c)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-colors ${novaCas === c ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-100 text-gray-600 bg-white"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Délka</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setNovaDelka(Math.max(30, novaDelka - 30))} className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-600 text-lg">−</button>
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-2.5 text-sm font-medium text-gray-900 text-center">
                    {novaDelka >= 60 ? `${Math.floor(novaDelka/60)} hod${novaDelka%60 ? ` ${novaDelka%60} min` : ""}` : `${novaDelka} min`}
                  </div>
                  <button onClick={() => setNovaDelka(novaDelka + 30)} className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-600 text-lg">+</button>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 flex gap-2">
              <button onClick={() => setShowNova(false)} className="flex-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-xl py-3 text-sm font-medium">Zrušit</button>
              <button onClick={handleUlozit} disabled={!novaKlientkaId} className="flex-1 bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40">Uložit</button>
            </div>
          </div>
        </div>
      )}

      {editRezervace && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end max-w-md mx-auto">
          <div className="bg-white rounded-t-2xl w-full flex flex-col" style={{maxHeight: "calc(100vh - 64px)"}}>
            <div className="flex-shrink-0 px-5 pt-5 pb-3">
              <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-medium text-gray-900">{getKlientka(editRezervace.klientkaId)?.jmeno}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{editRezervace.casOd} · {editRezervace.sluzba}</p>
                </div>
                <button onClick={() => { setEditRezervaceId(null); router.push(`/klientky/${editRezervace.klientkaId}`) }}
                  className="text-xs text-emerald-600 font-medium px-3 py-1.5 bg-emerald-50 rounded-lg">
                  Karta klientky
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-2">
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Služba</label>
                <div className="flex flex-wrap gap-2">
                  {SLUZBY.map((s) => (
                    <button key={s} onClick={() => upravitRezervaci(editRezervace.id, { sluzba: s })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${editRezervace.sluzba === s ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-100 text-gray-600 bg-white"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Čas začátku</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"].map((c) => (
                    <button key={c} onClick={() => upravitRezervaci(editRezervace.id, { casOd: c })}
                      className={`py-2 rounded-xl text-xs font-medium border transition-colors ${editRezervace.casOd === c ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-100 text-gray-600 bg-white"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Délka</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => upravitRezervaci(editRezervace.id, { delkaMinut: Math.max(30, editRezervace.delkaMinut - 30) })}
                    className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-600 text-lg">−</button>
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-2.5 text-sm font-medium text-gray-900 text-center">
                    {editRezervace.delkaMinut >= 60 ? `${Math.floor(editRezervace.delkaMinut/60)} hod${editRezervace.delkaMinut%60 ? ` ${editRezervace.delkaMinut%60} min` : ""}` : `${editRezervace.delkaMinut} min`}
                  </div>
                  <button onClick={() => upravitRezervaci(editRezervace.id, { delkaMinut: editRezervace.delkaMinut + 30 })}
                    className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-600 text-lg">+</button>
                </div>
              </div>
              <button onClick={() => { smazatRezervaci(editRezervace.id); setEditRezervaceId(null) }}
                className="w-full border border-red-100 bg-red-50 text-red-500 rounded-xl py-2.5 text-sm font-medium">
                Smazat rezervaci
              </button>
            </div>
            <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setEditRezervaceId(null)}
                className="w-full bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium">Hotovo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function KalendarPage() {
  return <Suspense><KalendarContent /></Suspense>
}
