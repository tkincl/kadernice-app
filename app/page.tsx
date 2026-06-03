"use client"

import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"
import { Rezervace } from "@/types"

const DNES = new Date().toISOString().split("T")[0]

function getStavBarva(stav: Rezervace["stav"]) {
  switch (stav) {
    case "hotovo": return "bg-emerald-100 border-emerald-200"
    case "probiha": return "bg-emerald-500 border-emerald-500"
    case "ceka": return "bg-white border-gray-100"
  }
}

function getStavDot(stav: Rezervace["stav"]) {
  switch (stav) {
    case "hotovo": return "bg-emerald-300"
    case "probiha": return "bg-white"
    case "ceka": return "bg-gray-200"
  }
}

const DNY_CZ = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"]
const MESICE_CZ = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"]

export default function PrehledDne() {
  const router = useRouter()
  const { getRezervaceProDen, getKlientka, getDenniTrzba } = useAppStore()

  const rezervace = getRezervaceProDen(DNES)
  const trzba = getDenniTrzba(DNES)
  const hotove = rezervace.filter((r) => r.stav === "hotovo").length
  const zbyvaji = rezervace.filter((r) => r.stav !== "hotovo").length

  const dnes = new Date()
  const datumText = `${DNY_CZ[dnes.getDay()]}, ${dnes.getDate()}. ${MESICE_CZ[dnes.getMonth()]}`

  return (
    <div className="flex flex-col" style={{height: "calc(100dvh - 80px)"}}>
      <div className="flex-shrink-0 px-4 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{datumText}</h1>
            <p className="text-sm text-gray-400">Dobrý den, Markéto</p>
          </div>
          <button
            onClick={() => router.push("/kalendar")}
            className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center"
          >
            <svg width="20" height="20" fill="none" stroke="#6b7280" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-sm text-gray-400 mb-1">Dnešní tržba</p>
            <p className="text-2xl font-medium text-gray-900">
              {trzba.toLocaleString("cs-CZ")} Kč
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-sm text-gray-400 mb-1">Zbývá dnes</p>
            <p className="text-2xl font-medium text-gray-900">
              {zbyvaji}{" "}
              <span className="text-sm font-normal text-gray-400">
                ({hotove} hotovo)
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Dnešní plán
        </p>
        <div className="flex flex-col gap-2">
          {rezervace.map((r) => {
            const klientka = getKlientka(r.klientkaId)
            const aktivni = r.stav === "probiha"
            return (
              <button
                key={r.id}
                onClick={() => router.push(`/klientky/${r.klientkaId}`)}
                className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${getStavBarva(r.stav)} ${r.stav === "hotovo" ? "opacity-50" : ""}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${getStavDot(r.stav)}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-base font-semibold truncate ${aktivni ? "text-white" : "text-gray-900"}`}>
                    {klientka?.jmeno ?? "Neznámá"}
                  </p>
                  <p className={`text-sm ${aktivni ? "text-emerald-100" : "text-gray-400"}`}>
                    {r.sluzba}
                    {aktivni && " · právě teď"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-medium ${aktivni ? "text-emerald-100" : "text-gray-400"}`}>
                    {r.casOd}
                  </p>
                  {r.cena && (
                    <p className={`text-sm ${aktivni ? "text-white" : "text-gray-500"}`}>
                      {r.cena.toLocaleString("cs-CZ")} Kč
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
        <button
          onClick={() => router.push("/kalendar")}
          className="w-full bg-emerald-500 text-white rounded-2xl py-4 text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nová rezervace
        </button>
      </div>
    </div>
  )
}
