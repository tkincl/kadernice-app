"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"

function getInitials(jmeno: string) {
  return jmeno.split(" ").map((s) => s[0]).join("").toUpperCase().slice(0, 2)
}


function validateTelefon(tel: string): string | null {
  const cislice = tel.replace(/[^0-9]/g, "")
  if (cislice.length === 0) return null
  if (cislice.length < 9) return "Telefonní číslo musí mít 9 číslic"
  if (cislice.length > 9) return "Telefonní číslo musí mít 9 číslic"
  return null
}

function formatTelefon(val: string): string {
  const cislice = val.replace(/[^0-9]/g, "").slice(0, 9)
  if (cislice.length <= 3) return cislice
  if (cislice.length <= 6) return cislice.slice(0,3) + " " + cislice.slice(3)
  return cislice.slice(0,3) + " " + cislice.slice(3,6) + " " + cislice.slice(6)
}

function TelefonInput({ value, onChange, autoFocus }: {
  value: string
  onChange: (val: string) => void
  autoFocus?: boolean
}) {
  const chyba = validateTelefon(value)
  const jeVyplnene = value.replace(/[^0-9]/g, "").length > 0
  return (
    <div>
      <input
        type="tel"
        placeholder="777 123 456"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(formatTelefon(e.target.value))}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors ${
          jeVyplnene && chyba
            ? "border-red-300 bg-red-50 focus:border-red-400"
            : jeVyplnene && !chyba
            ? "border-emerald-200 bg-emerald-50 focus:border-emerald-300"
            : "bg-gray-50 border-gray-100 focus:border-emerald-300"
        }`}
      />
      {jeVyplnene && chyba && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          {chyba}
        </p>
      )}
      {jeVyplnene && !chyba && (
        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          V pořádku
        </p>
      )}
    </div>
  )
}

export default function KartaKlientky() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { getKlientka, rezervace, upravitRezervaci, upravitKlientku, smazatKlientku } = useAppStore()
  const klientka = getKlientka(id)

  const [showPlatba, setShowPlatba] = useState(false)
  const [platbaRezervaceId, setPlatbaRezervaceId] = useState<string | null>(null)
  const [castka, setCastka] = useState("")
  const [showEdit, setShowEdit] = useState(false)
  const [editJmeno, setEditJmeno] = useState("")
  const [editTelefon, setEditTelefon] = useState("")
  const [editPoznamka, setEditPoznamka] = useState("")
  const [showSmazat, setShowSmazat] = useState(false)
  const [zobrazenaFotka, setZobrazenaFotka] = useState<string | null>(null)

  if (!klientka) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">Klientka nenalezena</p>
      </div>
    )
  }

  const klientcinyRezervace = rezervace
    .filter((r) => r.klientkaId === id)
    .sort((a, b) => b.datum.localeCompare(a.datum))

  const aktivniRezervace = klientcinyRezervace.find(
    (r) => r.stav === "probiha" || r.stav === "ceka"
  )

  const handleZaplatit = (rezervaceId: string, cena?: number) => {
    setPlatbaRezervaceId(rezervaceId)
    setCastka(cena?.toString() ?? "")
    setShowPlatba(true)
  }

  const handlePotvrzeniPlatby = () => {
    if (!platbaRezervaceId) return
    upravitRezervaci(platbaRezervaceId, { zaplaceno: true, cena: parseInt(castka) || undefined, stav: "hotovo" })
    setShowPlatba(false)
  }

  const handleEditOpen = () => {
    setEditJmeno(klientka.jmeno)
    setEditTelefon(klientka.telefon ?? "")
    setEditPoznamka(klientka.poznamka ?? "")
    setShowEdit(true)
  }

  const handleEditUlozit = async () => {
    await upravitKlientku(id, {
      jmeno: editJmeno.trim() || klientka.jmeno,
      telefon: editTelefon.trim(),
      poznamka: editPoznamka.trim() || undefined,
    })
    setShowEdit(false)
  }

  const handleSmazat = async () => {
    await smazatKlientku(id)
    router.replace("/klientky")
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-100">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          Zpět
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700 flex-shrink-0">
            {getInitials(klientka.jmeno)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-medium text-gray-900">{klientka.jmeno}</h1>
            {klientka.telefon && (
              <a href={`tel:${klientka.telefon}`} className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16z"/>
                </svg>
                {klientka.telefon}
              </a>
            )}
            {klientka.poznamka && (
              <p className="text-xs text-orange-600 bg-orange-50 rounded px-1.5 py-0.5 inline-block mt-0.5">⚠ {klientka.poznamka}</p>
            )}
          </div>
          {/* Edit tlacitko */}
          <button onClick={handleEditOpen}
            className="w-8 h-8 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0">
            <svg width="15" height="15" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Akce */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button className="bg-blue-50 border border-blue-100 rounded-xl py-3.5 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <svg width="18" height="18" fill="none" stroke="#1d4ed8" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
            <span className="text-xs font-medium text-blue-700">Vyfotit vlasy</span>
          </button>
          <button className="bg-amber-50 border border-amber-100 rounded-xl py-3.5 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
              <svg width="18" height="18" fill="none" stroke="#92400e" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
              </svg>
            </div>
            <span className="text-xs font-medium text-amber-700">Vyfotit recept</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => aktivniRezervace && handleZaplatit(aktivniRezervace.id, aktivniRezervace.cena)}
            disabled={!aktivniRezervace}
            className="border border-gray-100 rounded-xl py-3 flex flex-col items-center gap-1 active:scale-[0.97] transition-transform disabled:opacity-30">
            <svg width="20" height="20" fill="none" stroke="#4b5563" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
            </svg>
            <span className="text-xs font-medium text-gray-700">Zaplatit</span>
          </button>
          <button
            onClick={() => router.push("/kalendar")}
            className="bg-emerald-500 rounded-xl py-3 flex flex-col items-center gap-1 active:scale-[0.97] transition-transform">
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4"/>
            </svg>
            <span className="text-xs font-medium text-white">Objednat příště</span>
          </button>
        </div>
      </div>

      {/* Historie */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Historie návštěv</p>
        {klientcinyRezervace.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-6">Zatím žádné návštěvy</p>
        )}
        <div className="flex flex-col gap-3">
          {klientcinyRezervace.map((r) => (
            <div key={r.id} className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500">
                  {new Date(r.datum).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                <span className="text-xs text-gray-400">{r.sluzba}</span>
                <span className="text-xs font-medium text-gray-700">{r.cena ? `${r.cena.toLocaleString("cs-CZ")} Kč` : "—"}</span>
              </div>
              <div className="flex gap-2 p-2.5">
                {/* Fotka vlasu - nahled nebo placeholder */}
                {r.fotoVlasu ? (
                  <button onClick={() => setZobrazenaFotka(r.fotoVlasu!)}
                    className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={r.fotoVlasu} alt="vlasy" className="w-full h-full object-cover"/>
                  </button>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-blue-50 flex flex-col items-center justify-center gap-1 flex-shrink-0">
                    <svg width="20" height="20" fill="none" stroke="#3b82f6" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                    </svg>
                    <span className="text-[9px] text-blue-400">vlasy</span>
                  </div>
                )}
                {/* Fotka receptu - nahled nebo placeholder */}
                {r.fotoReceptu ? (
                  <button onClick={() => setZobrazenaFotka(r.fotoReceptu!)}
                    className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={r.fotoReceptu} alt="recept" className="w-full h-full object-cover"/>
                  </button>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-amber-50 flex flex-col items-center justify-center gap-1 flex-shrink-0">
                    <svg width="20" height="20" fill="none" stroke="#d97706" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
                    </svg>
                    <span className="text-[9px] text-amber-500">recept</span>
                  </div>
                )}
                {!r.fotoVlasu && !r.fotoReceptu && (
                  <p className="text-xs text-gray-400 self-center pl-1">Zatím bez fotek</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Smazat klientku */}
        <button onClick={() => setShowSmazat(true)}
          className="w-full mt-6 border border-red-100 bg-red-50 text-red-500 rounded-xl py-2.5 text-sm font-medium">
          Smazat klientku
        </button>
      </div>

      {/* Modal platba */}
      {showPlatba && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end max-w-md mx-auto">
          <div className="bg-white rounded-t-2xl w-full p-5">
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4"/>
            <h2 className="text-base font-medium text-gray-900 mb-1">Platba</h2>
            <p className="text-xs text-gray-400 mb-4">{klientka.jmeno}</p>
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1">Částka (Kč)</label>
              <input autoFocus type="number" value={castka} onChange={(e) => setCastka(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-lg font-medium text-gray-900 outline-none focus:border-emerald-300 text-center" placeholder="0"/>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={handlePotvrzeniPlatby} className="bg-gray-50 border border-gray-100 text-gray-700 rounded-xl py-3 text-sm font-medium">Hotovost</button>
              <button onClick={handlePotvrzeniPlatby} className="bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium">QR kód</button>
            </div>
            <button onClick={() => setShowPlatba(false)} className="w-full text-gray-400 text-sm py-2">Zrušit</button>
          </div>
        </div>
      )}

      {/* Modal edit klientky */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end max-w-md mx-auto">
          <div className="bg-white rounded-t-2xl w-full p-5">
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4"/>
            <h2 className="text-base font-medium text-gray-900 mb-4">Upravit údaje</h2>
            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Jméno</label>
                <input type="text" value={editJmeno} onChange={(e) => setEditJmeno(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-300"/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Telefon</label>
                <TelefonInput value={editTelefon} onChange={setEditTelefon} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Poznámka</label>
                <textarea value={editPoznamka} onChange={(e) => setEditPoznamka(e.target.value)}
                  placeholder="Např. citlivá pokožka, alergie na barvivo..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-300 resize-none"/>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowEdit(false)} className="flex-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-xl py-3 text-sm font-medium">Zrušit</button>
              <button onClick={handleEditUlozit}
                disabled={editTelefon.length > 0 && validateTelefon(editTelefon) !== null}
                className="flex-1 bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40">Uložit</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal smazani klientky */}
      {showSmazat && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end max-w-md mx-auto">
          <div className="bg-white rounded-t-2xl w-full p-5">
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4"/>
            <h2 className="text-base font-medium text-gray-900 mb-1">Smazat klientku?</h2>
            <p className="text-xs text-gray-400 mb-4">{klientka.jmeno} · {klientcinyRezervace.length} návštěv · tato akce je nevratná</p>
            <div className="flex gap-2">
              <button onClick={() => setShowSmazat(false)} className="flex-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-xl py-3 text-sm font-medium">Zrušit</button>
              <button onClick={handleSmazat} className="flex-1 bg-red-500 text-white rounded-xl py-3 text-sm font-medium">Smazat</button>
            </div>
          </div>
        </div>
      )}

      {/* Zobrazeni fotky pres celou obrazovku */}
      {zobrazenaFotka && (
        <div className="fixed inset-0 bg-black z-[70] flex items-center justify-center max-w-md mx-auto"
          onClick={() => setZobrazenaFotka(null)}>
          <img src={zobrazenaFotka} alt="fotka" className="w-full h-full object-contain"/>
          <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}
    </div>
  )
}
