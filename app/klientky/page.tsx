"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"

function getInitials(jmeno: string) {
  return jmeno.split(" ").map((s) => s[0]).join("").toUpperCase().slice(0, 2)
}

const BARVY = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-pink-100 text-pink-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
]

function getBarvu(id: string) {
  return BARVY[parseInt(id) % BARVY.length] ?? BARVY[0]
}

function formatTelefon(val: string): string {
  const cislice = val.replace(/[^0-9]/g, "").slice(0, 9)
  if (cislice.length <= 3) return cislice
  if (cislice.length <= 6) return cislice.slice(0,3) + " " + cislice.slice(3)
  return cislice.slice(0,3) + " " + cislice.slice(3,6) + " " + cislice.slice(6)
}

function validateTelefon(tel: string): string | null {
  const cislice = tel.replace(/[^0-9]/g, "")
  if (cislice.length === 0) return null
  if (cislice.length < 9) return `Zbyva ${9 - cislice.length} cislic`
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
          V poradku
        </p>
      )}
    </div>
  )
}

export default function KlientkyPage() {
  const router = useRouter()
  const { klientky, pridatKlientku } = useAppStore()
  const [hledani, setHledani] = useState("")
  const [showNova, setShowNova] = useState(false)
  const [noveJmeno, setNoveJmeno] = useState("")
  const [noveTelefon, setNoveTelefon] = useState("")
  const [showImport, setShowImport] = useState(false)
  const [importKontakty, setImportKontakty] = useState<{jmeno: string, telefon: string, vybrana: boolean}[]>([])
  const [importuji, setImportuji] = useState(false)

  const filtrovane = klientky.filter(
    (k) => k.jmeno.toLowerCase().includes(hledani.toLowerCase()) || k.telefon.includes(hledani)
  )

  const posledniNavsteva = (id: string) => {
    const k = klientky.find((k) => k.id === id)
    if (!k || k.navstevy.length === 0) return null
    return k.navstevy.sort((a, b) => b.datum.localeCompare(a.datum))[0]
  }

  const handlePridat = async () => {
    if (!noveJmeno.trim()) return
    await pridatKlientku({ jmeno: noveJmeno.trim(), telefon: noveTelefon.trim(), fotkyVlasu: [] })
    setShowNova(false)
    setNoveJmeno("")
    setNoveTelefon("")
    router.push("/klientky")
  }

  const handleImportKontaktu = async () => {
    if (!("contacts" in navigator)) {
      setShowImport(true)
      return
    }
    try {
      const contacts = await (navigator as any).contacts.select(["name", "tel"], { multiple: true })
      const zpracovane = contacts
        .filter((c: any) => c.name?.[0] && c.tel?.[0])
        .map((c: any) => ({
          jmeno: c.name[0],
          telefon: formatTelefon(c.tel[0].replace(/[^0-9]/g, "").slice(-9)),
          vybrana: true,
        }))
      setImportKontakty(zpracovane)
      setShowImport(true)
    } catch (e) {
      setShowImport(true)
    }
  }

  const handleUlozitImport = async () => {
    const vybrane = importKontakty.filter(k => k.vybrana)
    if (vybrane.length === 0) return
    setImportuji(true)
    for (const k of vybrane) {
      await pridatKlientku({ jmeno: k.jmeno, telefon: k.telefon, fotkyVlasu: [] })
    }
    setImportuji(false)
    setShowImport(false)
    setImportKontakty([])
  }

  return (
    <div className="flex flex-col" style={{height: "calc(100dvh - 80px)"}}>
      <div className="flex-shrink-0 px-4 pt-5 pb-3 border-b border-gray-100">
        <h1 className="text-xl font-medium text-gray-900 mb-3">Klientky</h1>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
          <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Hledat jmeno nebo telefon..."
            value={hledani}
            onChange={(e) => setHledani(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {filtrovane.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-10">Zadna klientka nenalezena</p>
        )}
        {filtrovane.map((k) => {
          const posl = posledniNavsteva(k.id)
          return (
            <button
              key={k.id}
              onClick={() => router.push(`/klientky/${k.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 active:bg-gray-50 transition-colors text-left"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${getBarvu(k.id)}`}>
                {getInitials(k.jmeno)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-gray-900 truncate">{k.jmeno}</p>
                <p className="text-sm text-gray-400">
                  {k.telefon && <span className="mr-2">{k.telefon}</span>}
                  {posl ? `${posl.sluzba}` : "Nova klientka"}
                </p>
              </div>
              <svg width="16" height="16" fill="none" stroke="#d1d5db" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          )
        })}
      </div>

      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-white flex gap-2">
        <button
          onClick={() => setShowNova(true)}
          className="flex-1 bg-emerald-500 text-white rounded-xl py-3.5 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Pridat
        </button>
        <button
          onClick={handleImportKontaktu}
          className="flex-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl py-3.5 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Z kontaktu
        </button>
      </div>

      {showNova && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end max-w-md mx-auto">
          <div className="bg-white rounded-t-2xl w-full p-5">
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4"/>
            <h2 className="text-base font-medium text-gray-900 mb-1">Nova klientka</h2>
            <p className="text-xs text-gray-400 mb-4">Staci jmeno, ostatni doplnis pozdeji</p>
            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-1">Jmeno *</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Jana Novakova"
                  value={noveJmeno}
                  onChange={(e) => setNoveJmeno(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-1">Telefon</label>
                <TelefonInput value={noveTelefon} onChange={setNoveTelefon} />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNova(false)}
                className="flex-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-xl py-3 text-sm font-medium"
              >
                Zrusit
              </button>
              <button
                onClick={handlePridat}
                disabled={!noveJmeno.trim() || (noveTelefon.length > 0 && validateTelefon(noveTelefon) !== null)}
                className="flex-1 bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40"
              >
                Vytvorit
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end max-w-md mx-auto">
          <div className="bg-white rounded-t-2xl w-full flex flex-col" style={{maxHeight: "calc(100dvh - 64px)"}}>
            <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4"/>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Import klientek</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {importKontakty.length > 0
                      ? `${importKontakty.filter(k => k.vybrana).length} vybranych z ${importKontakty.length}`
                      : "Pridej klientky rucne nebo povol pristup ke kontaktum"}
                  </p>
                </div>
                {importKontakty.length > 0 && (
                  <button
                    onClick={() => setImportKontakty(prev => prev.map(k => ({...k, vybrana: !prev.every(x => x.vybrana)})))}
                    className="text-xs text-emerald-600 font-medium px-3 py-1.5 bg-emerald-50 rounded-lg"
                  >
                    {importKontakty.every(k => k.vybrana) ? "Odznacit vse" : "Vybrat vse"}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {importKontakty.length === 0 ? (
                <div className="px-5 py-4">
                  <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                    Zadej klientky rucne – kazda na novy radek ve formatu: Jmeno, telefon
                  </p>
                  <p className="text-xs font-mono bg-gray-50 rounded-xl p-3 text-gray-400 mb-3">
                    Jana Novakova, 777 123 456 | Blanka Ticha, 603 456 789
                  </p>
                  <textarea
                    placeholder="Jana Novakova | Blanka Ticha"
                    rows={6}
                    onChange={(e) => {
                      const radky = e.target.value.split("\n").filter((r: string) => r.trim())
                      const kontakty = radky.map((r: string) => {
                        const casti = r.split(",").map((s: string) => s.trim())
                        return {
                          jmeno: casti[0] ?? "",
                          telefon: casti[1] ? formatTelefon(casti[1].replace(/[^0-9]/g, "")) : "",
                          vybrana: true
                        }
                      }).filter((k: any) => k.jmeno)
                      setImportKontakty(kontakty)
                    }}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-300 resize-none"
                  />
                </div>
              ) : (
                importKontakty.map((k, i) => (
                  <button
                    key={i}
                    onClick={() => setImportKontakty(prev => prev.map((x, j) => j === i ? {...x, vybrana: !x.vybrana} : x))}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 text-left transition-colors ${k.vybrana ? "bg-emerald-50" : "bg-white"}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${k.vybrana ? "bg-emerald-500 border-emerald-500" : "border-gray-200"}`}>
                      {k.vybrana && (
                        <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{k.jmeno}</p>
                      {k.telefon && <p className="text-xs text-gray-400">{k.telefon}</p>}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => { setShowImport(false); setImportKontakty([]) }}
                className="flex-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-xl py-3 text-sm font-medium"
              >
                Zrusit
              </button>
              <button
                onClick={handleUlozitImport}
                disabled={importuji || importKontakty.filter(k => k.vybrana).length === 0}
                className="flex-1 bg-emerald-500 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {importuji ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Ukladam...
                  </>
                ) : (
                  `Pridat ${importKontakty.filter(k => k.vybrana).length} klientek`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
