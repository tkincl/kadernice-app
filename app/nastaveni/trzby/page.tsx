"use client"

import { useState } from "react"
import { useAppStore } from "@/store/useAppStore"
import { useRouter } from "next/navigation"

function formatCastka(castka: number) {
  return castka.toLocaleString("cs-CZ") + " Kč"
}

function getDnyVRozsahu(od: string, do_: string): string[] {
  const dny: string[] = []
  const start = new Date(od)
  const end = new Date(do_)
  const cur = new Date(start)
  while (cur <= end) {
    dny.push(cur.toISOString().split("T")[0])
    cur.setDate(cur.getDate() + 1)
  }
  return dny
}

export default function TrzbyPage() {
  const router = useRouter()
  const { rezervace, getKlientka } = useAppStore()

  const dnes = new Date()
  const prvniDenMesice = new Date(dnes.getFullYear(), dnes.getMonth(), 1).toISOString().split("T")[0]
  const dnesStr = dnes.toISOString().split("T")[0]

  const [od, setOd] = useState(prvniDenMesice)
  const [do_, setDo] = useState(dnesStr)

  const dnyRozsah = getDnyVRozsahu(od, do_)

  const filtrovane = rezervace.filter(
    (r) => r.zaplaceno && dnyRozsah.includes(r.datum)
  ).sort((a, b) => a.datum.localeCompare(b.datum) || a.casOd.localeCompare(b.casOd))

  const celkem = filtrovane.reduce((sum, r) => sum + (r.cena ?? 0), 0)

  // Seskupeni po dnech
  const podleDnu: Record<string, typeof filtrovane> = {}
  filtrovane.forEach((r) => {
    if (!podleDnu[r.datum]) podleDnu[r.datum] = []
    podleDnu[r.datum].push(r)
  })

  // Seskupeni po sluzbách
  const podleSluzeb: Record<string, { pocet: number; celkem: number }> = {}
  filtrovane.forEach((r) => {
    if (!podleSluzeb[r.sluzba]) podleSluzeb[r.sluzba] = { pocet: 0, celkem: 0 }
    podleSluzeb[r.sluzba].pocet++
    podleSluzeb[r.sluzba].celkem += r.cena ?? 0
  })

  const handleTiskPDF = () => {
    window.print()
  }

  return (
    <div className="flex flex-col" style={{height: "calc(100dvh - 80px)"}}>
      <div className="flex-shrink-0 px-4 pt-5 pb-3 border-b border-gray-100">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          Zpět
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Tržby</h1>
      </div>

      {/* Filtr datumu */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Období</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Od</label>
            <input type="date" value={od} onChange={(e) => setOd(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-300"/>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Do</label>
            <input type="date" value={do_} onChange={(e) => setDo(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-300"/>
          </div>
        </div>
        {/* Rychle filtry */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Tento měsíc", od: prvniDenMesice, do: dnesStr },
            { label: "Minulý měsíc", od: new Date(dnes.getFullYear(), dnes.getMonth()-1, 1).toISOString().split("T")[0], do: new Date(dnes.getFullYear(), dnes.getMonth(), 0).toISOString().split("T")[0] },
            { label: "Tento rok", od: `${dnes.getFullYear()}-01-01`, do: dnesStr },
          ].map((f) => (
            <button key={f.label} onClick={() => { setOd(f.od); setDo(f.do) }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                od === f.od && do_ === f.do ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-100 text-gray-600 bg-white"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        {/* Souhrn */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <p className="text-xs text-emerald-600 mb-1">Celková tržba</p>
            <p className="text-2xl font-bold text-emerald-700">{formatCastka(celkem)}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">Počet návštěv</p>
            <p className="text-2xl font-bold text-gray-700">{filtrovane.length}</p>
          </div>
        </div>

        {/* Prehled po sluzbách */}
        {Object.keys(podleSluzeb).length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Podle služeb</p>
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              {Object.entries(podleSluzeb).sort((a,b) => b[1].celkem - a[1].celkem).map(([sluzba, data], i, arr) => (
                <div key={sluzba} className={`flex items-center justify-between px-4 py-3 ${i < arr.length-1 ? "border-b border-gray-50" : ""}`}>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sluzba}</p>
                    <p className="text-xs text-gray-400">{data.pocet}× návštěv</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{formatCastka(data.celkem)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailni prehled po dnech */}
        {Object.keys(podleDnu).length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Denní přehled</p>
            {Object.entries(podleDnu).reverse().map(([datum, rzv]) => {
              const denCelkem = rzv.reduce((s, r) => s + (r.cena ?? 0), 0)
              return (
                <div key={datum} className="border border-gray-100 rounded-2xl overflow-hidden mb-2">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(datum + "T12:00:00").toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })}
                    </span>
                    <span className="text-sm font-semibold text-emerald-600">{formatCastka(denCelkem)}</span>
                  </div>
                  {rzv.map((r) => {
                    const k = getKlientka(r.klientkaId)
                    return (
                      <div key={r.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm text-gray-900">{k?.jmeno ?? "—"}</p>
                          <p className="text-xs text-gray-400">{r.sluzba} · {r.casOd}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{r.cena ? formatCastka(r.cena) : "—"}</p>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        {filtrovane.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">Žádné zaplacené návštěvy v tomto období</p>
          </div>
        )}
      </div>

      {/* PDF tlacitko */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
        <button onClick={handleTiskPDF}
          className="w-full bg-emerald-500 text-white rounded-2xl py-4 text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Vytisknout / Uložit PDF
        </button>
      </div>
    </div>
  )
}
