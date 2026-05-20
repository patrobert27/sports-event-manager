import React from "react";
import { NavLink } from "react-router-dom";

export default function SidebarItem({ to = "#", icon = null, children, isActive }) {
  return (
    <NavLink
      to={to}
      className={({ isActive: defaultActive }) => {
        const active = isActive !== undefined ? isActive : defaultActive;
        return `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? 'bg-primary/10 text-primary font-semibold' : 'text-muted hover:bg-primary/5 hover:text-dark'}`;
      }}
    >
      {icon && <span className="w-7 h-7 flex items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</span>}
      <span>{children}</span>
    </NavLink>
  );
}
