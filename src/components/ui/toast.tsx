"use client";

export default function Toast({ message, tone = "error", onDismiss }: { message: string; tone?: "error" | "success"; onDismiss?: () => void }) {
  if (!message) return null;
  return <div role={tone === "error" ? "alert" : "status"} className={`fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-lg items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm shadow-lg sm:inset-x-auto sm:right-6 ${tone === "error" ? "border-[#ead9d6] bg-white text-[#963d35]" : "border-[#d3e3d1] bg-white text-[#285c46]"}`}>
    <p className="leading-6">{message}</p>
    {onDismiss ? <button type="button" aria-label="Fermer la notification" onClick={onDismiss} className="grid size-7 shrink-0 place-items-center rounded-full text-lg hover:bg-black/5">×</button> : null}
  </div>;
}
