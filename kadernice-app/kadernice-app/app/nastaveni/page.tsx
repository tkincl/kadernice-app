"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"
import { Sluzba } from "@/types"

const SLUZBY: Sluzba[] = ["Střih", "Barvení", "Melír", "Foukaná", "Balayage", "Přeliv", "Jiné"]

export default function NastaveniPage() {
  const router = useRouter()
  const { poptavky, odmitnoutPoptavku, vytvorKlientkuZPoptavky } = useAppStore()
  const [showPoptavka, setShowPoptavka] = useState<string | null>(null)
  const [showVytvorit, setShowVytvorit] = useState<string | null>(null)
  const [datum, setDatum] = useState("2026-06-06")
  const [cas, setCas] = useState("14:00")
  const [delka, setDelka] = useState(120)
  const [sluzba, setSluzba] = useState<Sluzba>("Barvení")

  const novePoptavky = poptavky.filter((p) => p.stav === "nova")
  const vyrizenePoptavky = poptavky.filter((p) => p.stav !== "nova")

  const aktivniPoptavka = showPoptavka
    ? poptavky.find((p) => p.id === showPoptavka)
    : null

  const handleVytvorit = () => {
    if (!showVytvorit) return
    vytvorKlientkuZPoptavky(showVytvorit, datum, cas, delka, sluzba)
    setShowVytvorit(null)
  }

  const NAV_POLOZKY = [
    {
      icon: (
        <svg width="18" height="18" fill="none" stroke="#0f6e56" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
      bg: "bg-emerald-50",
      label: "Rezervační odkaz",
      desc: "Sdílet novým zákaznicím",
      onClick: () => {},
    },
    {
      icon: (
        <svg width="18" height="18" fill="none" stroke="#92400e" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      bg: "bg-amber-50",
      label: "Export PDF",
      desc: "Tržby pro účetní",
      onClick: () => {},
    },
    {
      icon: (
        <svg width="18" height="18" fill="none" stroke="#1d4ed8" strokeWidth="1.5" viewBox="0 0 24 24">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      ),
      bg: "bg-blue-50",
      label: "Platební nastavení",
      desc: "Zálohy, QR účet",
      onClick: () => {},
    },
    {
      icon: (
        <svg width="18" height="18" fill="none" stroke="#4b5563" strokeWidth="1.5" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </svg>
      ),
      bg: "bg-gray-100",
      label: "Můj profil",
      desc: "Jméno, salon, foto",
      onClick: () => {},
    },
  ]

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0 px-4 pt-5 pb-3 border-b border-gray-100">
        <h1 className="text-xl font-medium text-gray-900">Nastavení</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Poptávky */}
        <button
          onClick={() => novePoptavky.length > 0 && setShowPoptavka(novePoptavky[0].id)}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 active:bg-gray-50"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" fill="none" stroke="#c2410c" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900">Poptávky o rezervaci</p>
            <p className="text-xs text-gray-400">
              {novePoptavky.length > 0 ? `${novePoptavky.length} nové zákaznice čekají` : "Žádné nové poptávky"}
            </p>
          </div>
          {novePoptavky.length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {novePoptavky.length}
            </span>
          )}
          <svg width="16" height="16" fill="none" stroke="#d1d5db" strokeWidth="2" viewBox="0 0 24 24">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        {/* Ostatní nastavení */}
        {NAV_POLOZKY.map((p, i) => (
          <button
            key={i}
            onClick={p.onClick}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 active:bg-gray-50"
          >
            <div className={`w-10 h-10 rounded-xl ${p.bg} flex items-center justify-center flex-shrink-0`}>
              {p.icon}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900">{p.label}</p>
              <p className="text-xs text-gray-400">{p.desc}</p>
            </div>
            <svg width="16" height="16" fill="none" stroke="#d1d5db" strokeWidth="2" viewBox="0 0 24 24">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>

      {/* Modal detail poptávky */}
      {aktivniPoptavka && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end max-w-md mx-auto">
          <div className="bg-white rounded-t-2xl w-full p-5 max-h-[85vh] overflow-y-auto">
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h2 className="text-base font-medium text-gray-900 mb-1">Nová poptávka</h2>
            <p className="text-xs text-gray-400 mb-4">
              {new Date(aktivniPoptavka.datum).toLocaleDateString("cs-CZ", {
                day: "numeric", month: "long",
              })}
            </p>

            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <p className="text-sm font-medium text-gray-900">{aktivniPoptavka.jmeno}</p>
              <p className="text-xs text-gray-500 mt-0.5">{aktivniPoptavka.sluzba} · {aktivniPoptavka.telefon}</p>
              {aktivniPoptavka.poznamka && (
                <p className="text-xs text-gray-500 mt-1.5 italic">"{aktivniPoptavka.poznamka}"</p>
              )}
            </div>

            <div className="flex gap-2 mb-3">
              <div className="w-16 h-16 rounded-xl bg-blue-50 flex flex-col items-center justify-center gap-1">
                <svg width="20" height="20" fill="none" stroke="#3b82f6" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" /><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                </svg>
                <span className="text-[9px] text-blue-400">vlasy</span>
              </div>
              <div className="w-16 h-16 rounded-xl bg-pink-50 flex flex-col items-center justify-center gap-1">
                <svg width="20" height="20" fill="none" stroke="#db2777" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="text-[9px] text-pink-400">inspirace</span>
              </div>
              <p className="text-xs text-gray-400 self-center pl-1">Foto nahraná zákaznicí</p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowPoptavka(null)
                  setShowVytvorit(aktivniPoptavka.id)
                  setSluzba(aktivniPoptavka.sluzba as Sluzba ?? "Jiné")
                }}
                className="w-full bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Vytvořit klientku a přidat termín
              </button>
              <button
                onClick={() => {
                  odmitnoutPoptavku(aktivniPoptavka.id)
                  setShowPoptavka(null)
                }}
                className="w-full bg-orange-50 text-orange-700 border border-orange-100 rounded-xl py-3 text-sm font-medium"
              >
                Odmítnout poptávku
              </button>
              <button
                onClick={() => setShowPoptavka(null)}
                className="w-full text-gray-400 text-sm py-2"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal vytvoření klientky z poptávky */}
      {showVytvorit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end max-w-md mx-auto">
          <div className="bg-white rounded-t-2xl w-full p-5 max-h-[85vh] overflow-y-auto">
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h2 className="text-base font-medium text-gray-900 mb-1">Nová klientka + termín</h2>
            <p className="text-xs text-gray-400 mb-4">Údaje předvyplněny z poptávky</p>

            {(() => {
              const p = poptavky.find((x) => x.id === showVytvorit)
              return p ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-emerald-800">{p.jmeno}</p>
                    <span className="text-[10px] bg-emerald-200 text-emerald-800 rounded px-1.5 py-0.5 font-medium">z poptávky</span>
                  </div>
                  <p className="text-xs text-emerald-600 mt-0.5">{p.telefon}</p>
                </div>
              ) : null
            })()}

            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Termín</label>
                <input
                  type="date"
                  value={datum}
                  onChange={(e) => setDatum(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Čas</label>
                <input
                  type="time"
                  value={cas}
                  onChange={(e) => setCas(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1.5">Délka</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setDelka(Math.max(30, delka - 30))} className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-600 text-lg">−</button>
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-2.5 text-sm font-medium text-gray-900 text-center">
                    {delka >= 60 ? `${Math.floor(delka / 60)} hod${delka % 60 ? ` ${delka % 60} min` : ""}` : `${delka} min`}
                  </div>
                  <button onClick={() => setDelka(delka + 30)} className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-600 text-lg">+</button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowVytvorit(null)} className="flex-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-xl py-3 text-sm font-medium">Zrušit</button>
              <button onClick={handleVytvorit} className="flex-1 bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium">Uložit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
