'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'

type EventoCode =
  | 'INGRESO_TERMINAL_CARGA'
  | 'SALIDA_TERMINAL_CARGADO'
  | 'ARRIBO_CLIENTE'
  | 'INICIO_DESCARGA'
  | 'FIN_DESCARGA'
  | 'ARRIBO_TERMINAL_VACIOS'

const EVENTOS: { code: EventoCode; label: string; hint: string }[] = [
  { code: 'INGRESO_TERMINAL_CARGA', label: 'Ingreso Terminal', hint: 'Entrada a terminal para carga' },
  { code: 'SALIDA_TERMINAL_CARGADO', label: 'Salida Cargado', hint: 'Sale de terminal con contenedor' },
  { code: 'ARRIBO_CLIENTE', label: 'Arribo Cliente', hint: 'Llegada a planta/almacén' },
  { code: 'INICIO_DESCARGA', label: 'Inicio Descarga', hint: 'Comienza descarga' },
  { code: 'FIN_DESCARGA', label: 'Fin Descarga', hint: 'Termina descarga' },
  { code: 'ARRIBO_TERMINAL_VACIOS', label: 'Arribo Vacíos', hint: 'Llega a patio/terminal vacíos' },
]

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ')
}

export default function Page() {
  const APPS_SCRIPT_URL = process.env.const res = await fetch("/api/event", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id_orden: idOrden.trim(),
    tipo_evento: tipoEvento,
    id_operador: idOperador.trim(),
    nota: nota.trim(),
  }),
}); || ''

  const [idOrden, setIdOrden] = useState('')
  const [idOperador, setIdOperador] = useState('OPR-0001')
  const [nota, setNota] = useState('')
  const [loading, setLoading] = useState<EventoCode | null>(null)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const ordenValida = useMemo(() => idOrden.trim().length >= 4, [idOrden])
  const operadorValido = useMemo(() => idOperador.trim().length >= 4, [idOperador])

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg })
    window.setTimeout(() => setToast(null), 2800)
  }

  async function enviarEvento(tipo_evento: EventoCode) {
    if (!APPS_SCRIPT_URL) {
      showToast('err', 'Falta configurar NEXT_PUBLIC_APPS_SCRIPT_URL')
      return
    }
    if (!ordenValida) {
      showToast('err', 'Escribe un ID_Orden válido (ej. ORD-000123)')
      return
    }
    if (!operadorValido) {
      showToast('err', 'Escribe un ID_Operador válido (ej. OPR-0001)')
      return
    }

    setLoading(tipo_evento)
    try {
      const res = await fetch("/api/event", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_orden: idOrden.trim(),
          tipo_evento,
          id_operador: idOperador.trim(),
          nota: nota.trim(),
        }),
      })

      // Apps Script a veces regresa text/plain; intentamos parsear
      const text = await res.text()
      let json: any = null
      try {
        json = JSON.parse(text)
      } catch {
        // si no es JSON, igual podemos considerar ok si status 200
      }

      if (!res.ok) {
        showToast('err', `Error API (${res.status})`) 
        return
      }

      if (json && json.status && json.status !== 'ok') {
        showToast('err', json.message || 'Error al registrar')
        return
      }

      showToast('ok', 'Evento registrado ✅')
      setNota('')
    } catch (e: any) {
      showToast('err', e?.message || 'Error de red')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
            <Image
              src="/torres-logo.jpg"
              alt="Transportes Torres TG"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Transportes Torres TG</div>
            <div className="text-xs text-neutral-400">Captura rápida de estatus</div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1">
              <span className="text-xs text-neutral-400">ID_Orden</span>
              <input
                value={idOrden}
                onChange={(e) => setIdOrden(e.target.value)}
                placeholder="ORD-000123"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
                inputMode="text"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-neutral-400">ID_Operador</span>
              <input
                value={idOperador}
                onChange={(e) => setIdOperador(e.target.value)}
                placeholder="OPR-0001"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
                inputMode="text"
              />
            </label>
            <label className="grid gap-1 md:col-span-1">
              <span className="text-xs text-neutral-400">Nota (opcional)</span>
              <input
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Ej. fila larga / acceso 2"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
                inputMode="text"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {EVENTOS.map((ev) => (
              <button
                key={ev.code}
                onClick={() => enviarEvento(ev.code)}
                disabled={loading !== null}
                className={cx(
                  'group flex items-start justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-left transition',
                  'hover:border-neutral-600 hover:bg-neutral-950/60',
                  loading !== null && 'opacity-70'
                )}
              >
                <div>
                  <div className="text-sm font-semibold">{ev.label}</div>
                  <div className="mt-0.5 text-xs text-neutral-400">{ev.hint}</div>
                </div>
                <div className="text-xs text-neutral-500">
                  {loading === ev.code ? 'Enviando…' : '→'}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 text-xs text-neutral-400">
            <div className="font-semibold text-neutral-300">Checklist rápido</div>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Configura <span className="text-neutral-200">NEXT_PUBLIC_APPS_SCRIPT_URL</span> en .env.local y Vercel.</li>
              <li>En Google Sheets deben existir pestañas: <span className="text-neutral-200">eventos_orden</span> y <span className="text-neutral-200">Ordenes</span>.</li>
              <li>La columna A de <span className="text-neutral-200">Ordenes</span> debe ser <span className="text-neutral-200">id_orden</span>.</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2">
          <div
            className={cx(
              'rounded-2xl border px-4 py-3 text-sm shadow-lg',
              toast.type === 'ok'
                ? 'border-emerald-700/60 bg-emerald-950 text-emerald-200'
                : 'border-rose-700/60 bg-rose-950 text-rose-200'
            )}
          >
            {toast.msg}
          </div>
        </div>
      )}

      <footer className="mx-auto max-w-3xl px-4 pb-10 text-center text-xs text-neutral-500">
        TG • Operaciones
      </footer>
    </div>
  )
}