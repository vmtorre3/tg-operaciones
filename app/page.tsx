"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type EventoCode =
  | "INGRESO_TERMINAL_CARGA"
  | "SALIDA_TERMINAL_CARGADO"
  | "ARRIBO_CLIENTE"
  | "INICIO_DESCARGA"
  | "FIN_DESCARGA"
  | "ARRIBO_TERMINAL_VACIOS";

const EVENTOS: { code: EventoCode; label: string; hint: string }[] = [
  { code: "INGRESO_TERMINAL_CARGA", label: "Ingreso Terminal", hint: "Entrada a terminal para carga" },
  { code: "SALIDA_TERMINAL_CARGADO", label: "Salida Cargado", hint: "Sale de terminal con contenedor" },
  { code: "ARRIBO_CLIENTE", label: "Arribo Cliente", hint: "Llegada a planta/almacén" },
  { code: "INICIO_DESCARGA", label: "Inicio Descarga", hint: "Comienza descarga" },
  { code: "FIN_DESCARGA", label: "Fin Descarga", hint: "Termina descarga" },
  { code: "ARRIBO_TERMINAL_VACIOS", label: "Arribo Vacíos", hint: "Llega a patio/terminal vacíos" },
];

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function Page() {
  const [idOrden, setIdOrden] = useState("");
  const [idOperador, setIdOperador] = useState("OPR-0001");
  const [nota, setNota] = useState("");

  const [loading, setLoading] = useState<EventoCode | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const ordenValida = useMemo(() => idOrden.trim().length >= 1, [idOrden]);
  const operadorValido = useMemo(() => idOperador.trim().length >= 2, [idOperador]);

  const showToast = (type: "ok" | "err", msg: string) => {
    setToast({ type, msg });
    window.setTimeout(() => setToast(null), 2800);
  };

  async function enviarEvento(tipo_evento: EventoCode) {
    if (!ordenValida) {
      showToast("err", "Escribe un ID_Orden válido (ej. 8098 o ORD-000123)");
      return;
    }
    if (!operadorValido) {
      showToast("err", "Escribe un ID_Operador válido (ej. OPR-0001)");
      return;
    }

    setLoading(tipo_evento);
    try {
      const res = await fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_orden: idOrden.trim(),
          tipo_evento,
          id_operador: idOperador.trim(),
          nota: nota.trim(),
        }),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        // Si no es JSON, igual seguimos con el status HTTP
      }

      if (!res.ok) {
        showToast("err", `Error API (${res.status})`);
        return;
      }

      if (json && json.status && json.status !== "ok") {
        showToast("err", json.message || "Error al registrar");
        return;
      }

      showToast("ok", "Evento registrado ✅");
      setNota("");
    } catch (e: any) {
      showToast("err", e?.message || "Error de red");
    } finally {
      setLoading(null);
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
