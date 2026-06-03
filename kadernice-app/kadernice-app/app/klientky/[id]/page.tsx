"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"

function getInitials(jmeno: string) {
  return jmeno.split(" ").map((s) => s[0]).join("").toUpperCase().slice(0, 2)
}

export default function KartaKlientky() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { getKlientka, rezervace, upravitRezervaci } = useAppStore()
  const klientka = getKlientka(id)

  const [showPlatba, setShowPlatba] = useState(false)
  const [platbaRezervaceId, setPlatbaRezervaceId] = useState<string | null>(null)
  const [castka, setCastka] = useState("")
  const [showObjednat, setShowObjednat] = useState(false)

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
    upravitRezervaci(platbaRezervaceId, {
      zaplaceno: true,
      cena: parseInt(castka) || undefined,
      stav: "hotovo",
    })
    setShowPlatba(false)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-400 mb-3"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Zpět
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700 flex-shrink-0">
            {getInitials(klientka.jmeno)}
          </div>
          <div>
            <h1 className="text-base font-medium text-gray-900">{klientka.jmeno}</h1>
            {klientka.poznamka && (
              <p className="text-xs text-orange-600 bg-orange-50 rounded px-1.5 py-0.5 inline-block mt-0.5">
                ⚠ {klientka.poznamka}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Akce */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100">
        {/* Focení */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button className="bg-blue-50 border border-blue-100 rounded-xl py-3.5 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <svg width="18" height="18" fill="none" stroke="#1d4ed8" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <span className="text-xs font-medium text-blue-700">Vyfotit vlasy</span>
          </button>
          <button className="bg-amber-50 border border-amber-100 rounded-xl py-3.5 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
              <svg width="18" height="18" fill="none" stroke="#92400e" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" />
              </svg>
            </div>
            <span className="text-xs font-medium text-amber-700">Vyfotit recept</span>
          </button>
        </div>

        {/* Platba a objednání */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => aktivniRezervace && handleZaplatit(aktivniRezervace.id, aktivniRezervace.cena)}
            disabled={!aktivniRezervace}
            className="border border-gray-100 rounded-xl py-3 flex flex-col items-center gap-1 active:scale-[0.97] transition-transform disabled:opacity-30"
          >
            <svg width="20" height="20" fill="none" stroke="#4b5563" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            <span className="text-xs font-medium text-gray-700">Zaplatit</span>
          </button>
          <button
            onClick={() => setShowObjednat(true)}
            className="bg-emerald-500 rounded-xl py-3 flex flex-col items-center gap-1 active:scale-[0.97] transition-transform"
          >
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" />
            </svg>
            <span className="text-xs font-medium text-white">Objednat příště</span>
          </button>
        </div>
      </div>

      {/* Historie */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Historie návštěv
        </p>
        {klientcinyRezervace.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-6">Zatím žádné návštěvy</p>
        )}
        <div className="flex flex-col gap-3">
          {klientcinyRezervace.map((r) => (
            <div key={r.id} className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500">
                  {new Date(r.datum).toLocaleDateString("cs-CZ", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="text-xs text-gray-400">{r.sluzba}</span>
                <span className="text-xs font-medium text-gray-700">
                  {r.cena ? `${r.cena.toLocaleString("cs-CZ")} Kč` : "—"}
                </span>
              </div>
              <div className="flex gap-2 p-2.5">
                {r.fotoVlasu ? (
                  <img src={r.fotoVlasu} alt="vlasy" className="w-14 h-14 rounded-lg object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-blue-50 flex flex-col items-center justify-center gap-1">
                    <svg width="20" height="20" fill="none" stroke="#3b82f6" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    </svg>
                    <span className="text-[9px] text-blue-400">vlasy</span>
                  </div>
                )}
                {r.fotoReceptu ? (
                  <img src={r.fotoReceptu} alt="recept" className="w-14 h-14 rounded-lg object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-amber-50 flex flex-col items-center justify-center gap-1">
                    <svg width="20" height="20" fill="none" stroke="#d97706" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" />
                    </svg>
                    <span className="text-[9px] text-amber-500">recept</span>
                  </div>
                )}
                <p className="text-xs text-gray-400 self-center pl-1">
                  {r.fotoVlasu || r.fotoReceptu ? "" : "Klepni pro přidání fotek"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal platba */}
      {showPlatba && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end max-w-md mx-auto">
          <div className="bg-white rounded-t-2xl w-full p-5">
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h2 className="text-base font-medium text-gray-900 mb-1">Platba</h2>
            <p className="text-xs text-gray-400 mb-4">{klientka.jmeno}</p>
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1">Částka (Kč)</label>
              <input
                autoFocus
                type="number"
                value={castka}
                onChange={(e) => setCastka(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-lg font-medium text-gray-900 outline-none focus:border-emerald-300 text-center"
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={handlePotvrzeniPlatby}
                className="bg-gray-50 border border-gray-100 text-gray-700 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z" />
                </svg>
                Hotovost
              </button>
              <button
                onClick={handlePotvrzeniPlatby}
                className="bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 3v18" />
                </svg>
                QR kód
              </button>
            </div>
            <button
              onClick={() => setShowPlatba(false)}
              className="w-full text-gray-400 text-sm py-2"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      {/* Modal objednat příště */}
      {showObjednat && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end max-w-md mx-auto">
          <div className="bg-white rounded-t-2xl w-full p-5">
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h2 className="text-base font-medium text-gray-900 mb-1">Objednat příště</h2>
            <p className="text-xs text-gray-400 mb-4">Přejdete do kalendáře pro výběr termínu</p>
            <button
              onClick={() => {
                setShowObjednat(false)
                router.push(`/kalendar?klientkaId=${id}`)
              }}
              className="w-full bg-emerald-500 text-white rounded-xl py-3.5 text-sm font-medium mb-2"
            >
              Otevřít kalendář
            </button>
            <button
              onClick={() => setShowObjednat(false)}
              className="w-full text-gray-400 text-sm py-2"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
