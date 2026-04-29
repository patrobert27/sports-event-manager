import React from "react";
import { Link } from "react-router-dom";

const items = [
  { key: "futbol", label: "Futbol" },
  { key: "basquet", label: "Bàsquet" },
  { key: "volei", label: "Vòlei" },
];

export default function SidebarNavigation() {
  return (
    <aside className="w-full sm:w-64 bg-white rounded-2xl p-4 shadow-lg border border-primary/10">
      <h4 className="text-sm font-semibold text-dark mb-3">Filtrar per esport</h4>
      <nav className="flex flex-col gap-2">
        {items.map((it) => (
          <Link
            key={it.key}
            to={`/jornades/competicions?activity=${encodeURIComponent(it.label)}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:bg-primary/5 hover:text-dark transition"
          >
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">{it.label[0]}</span>
            <span>{it.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
