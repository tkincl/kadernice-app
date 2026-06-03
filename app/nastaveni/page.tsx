"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"
export default function NastaveniPage() {
  const router = useRouter()
  const { poptavky, odmitnoutPoptavku, vytvorKlientkuZPoptavky } = useAppStore()
  const [showPoptavky, setShowPoptavky] = useState(false)
  const [showVytvorit, setShowVytvorit] = useState<string | null>(null)

  const novePoptavky = poptavky.filter((p) => p.stav === "nova")

  const handleVytvorit = async () => {
    if (!showVytvorit) return
    await vytvorKlientkuZPoptavky(showVytvorit)
    setShowVytvorit(null)
    setShowPoptavky(false)
    router.push("/kalendar")
  }

  return (
    <div className="flex flex-col" style={{height: "calc(100vh - 80px)"}}>
      <div className="flex-shrink-0 px-4 pt-5 pb-3 border-b border-gray-100">
        <h1 className="text-xl font-medium text-gray-900">Nastavení</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <button onClick={() => setShowPoptavky(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 active:bg-gray-50">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" fill="none" stroke="#c2410c" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900">Poptávky o rezervaci</p>
            <p className="text-xs text-gray-400">{novePoptavky.length > 0 ? `${novePoptavky.length} nové zákaznice čekají` : "Žádné nové poptávky"}</p>
          </div>
          {novePoptavky.length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">{novePoptavky.length}</span>
          )}
          <svg width="16" height="16" fill="none" stroke="#d1d5db" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
        </button>

        {[
          { bg: "bg-emerald-50", color: "#0f6e56", label: "Rezervační odkaz", desc: "Sdílet novým zákaznicím", path: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" },
          { bg: "bg-amber-50", color: "#92400e", label: "Tržby a export PDF", desc: "Přehled a výpis pro účetní", path: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8", href: "/nastaveni/trzby" },
          { bg: "bg-blue-50", color: "#1d4ed8", label: "Platební nastavení", desc: "Zálohy, QR účet", path: "M2 5h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zM2 10h20" },
          { bg: "bg-gray-100", color: "#4b5563", label: "Můj profil", desc: "Jméno, salon, foto", path: "M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" },
        ].map((item, i) => (
          <button key={i} onClick={() => (item as any).href && router.push((item as any).href)}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 active:bg-gray-50">
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
              <svg width="18" height="18" fill="none" stroke={item.color} strokeWidth="1.5" viewBox="0 0 24 24"><path d={item.path} /></svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
            <svg width="16" height="16" fill="none" stroke="#d1d5db" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        ))}
      </div>

      {/* Modal seznam poptavek */}
      {showPoptavky && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end max-w-md mx-auto">
          <div className="bg-white rounded-t-2xl w-full flex flex-col" style={{maxHeight: "calc(100vh - 64px)"}}>
            <div className="flex-shrink-0 px-5 pt-5 pb-3">
              <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <h2 className="text-base font-medium text-gray-900">Poptávky</h2>
              <p className="text-xs text-gray-400 mt-0.5">Nové zákaznice čekají na schválení</p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-2">
              {novePoptavky.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">Žádné nové poptávky</p>
              )}
              {novePoptavky.map((p) => (
                <div key={p.id} className="border border-gray-100 rounded-xl mb-3 overflow-hidden">
                  <div className="px-3 py-2.5 bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{p.jmeno}</p>
                    <p className="text-xs text-gray-500">{p.sluzba} · {p.telefon}</p>
                    {p.poznamka && <p className="text-xs text-gray-400 mt-1 italic">"{p.poznamka}"</p>}
                  </div>
                  <div className="flex gap-2 p-2.5">
                    <button
                      onClick={() => { setShowPoptavky(false); setShowVytvorit(p.id) }}
                      className="flex-1 bg-emerald-500 text-white rounded-lg py-2 text-xs font-medium">
                      Vytvořit klientku
                    </button>
                    <button
                      onClick={() => odmitnoutPoptavku(p.id)}
                      className="flex-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg py-2 text-xs font-medium">
                      Odmítnout
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setShowPoptavky(false)} className="w-full text-gray-400 text-sm py-2">Zavřít</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal potvrzeni vytvoreni klientky */}
      {showVytvorit && (() => {
        const p = poptavky.find((x) => x.id === showVytvorit)
        if (!p) return null
        return (
          <div className="fixed inset-0 bg-black/40 z-[60] flex items-end max-w-md mx-auto">
            <div className="bg-white rounded-t-2xl w-full p-5">
              <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <h2 className="text-base font-medium text-gray-900 mb-1">Vytvořit klientku</h2>
              <p className="text-xs text-gray-400 mb-4">Klientka bude uložena a přejdete do kalendáře</p>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-emerald-800">{p.jmeno}</p>
                  <span className="text-[10px] bg-emerald-200 text-emerald-800 rounded px-1.5 py-0.5 font-medium">z poptávky</span>
                </div>
                <p className="text-xs text-emerald-600">{p.telefon}</p>
                {p.poznamka && <p className="text-xs text-emerald-600 mt-1 italic">"{p.poznamka}"</p>}
              </div>

              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Po uložení přejdete do kalendáře, kde klientce najdete volný termín a zarezervujete ho.
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowVytvorit(null)}
                  className="flex-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-xl py-3 text-sm font-medium">
                  Zrušit
                </button>
                <button onClick={handleVytvorit}
                  className="flex-1 bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                  Uložit a do kalendáře
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
