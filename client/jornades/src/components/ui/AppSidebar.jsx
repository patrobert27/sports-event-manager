import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/authSelectors";
import { ADMIN_VARIANTS } from "../../constants/roles";
import SidebarItem from "./SidebarItem";
import SidebarUserSection from "./SidebarUserSection";
import SidebarLogoutButton from "./SidebarLogoutButton";

const DEFAULT_ITEMS = [
  { to: '/jornades', label: 'Panell' },
  { to: '/jornades/competicions', label: 'Jornades' },
];

export default function AppSidebar({ open = false, onClose, extra = [] }) {
  const user = useSelector(selectUser);
  const roleName = (user?.role?.name || "").toString().toLowerCase();
  const isAdmin = ADMIN_VARIANTS.includes(roleName);
  
  const items = [...DEFAULT_ITEMS];
  if (isAdmin) {
    items.push({ to: '/jornades/usuaris', label: 'Usuaris' });
    items.push({ to: '/jornades/activitats', label: 'Activitats' });
    items.push({ to: '/jornades/camps', label: 'Camps' });
  }

  return (
    <>
      {/* Overlay for mobile */}
      <div className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose} />

      <aside className={`fixed left-0 top-0 bottom-0 z-50 w-64 bg-white p-4 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block md:shadow-none shadow-lg`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark">Navegació</h3>
            <button onClick={onClose} className="md:hidden p-1 rounded-md text-muted">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 flex flex-col gap-2">
            {items.map((it) => (
              <SidebarItem
                key={it.to}
                to={it.to}
                icon={it.icon}>
                {it.label}
              </SidebarItem>
            ))}

            {extra.length > 0 && (
              <div className="mt-3 border-t border-primary/5 pt-3">
                <div className="text-xs text-muted uppercase mb-2">Esports</div>
                {extra.map((it) => (
                  <SidebarItem
                    key={it.to}
                    to={it.to}
                    icon={it.icon}>
                    {it.label}
                  </SidebarItem>
                ))}
              </div>
            )}
          </nav>

          <div className="mt-4 pt-4 border-t border-primary/5">
            <SidebarUserSection />
            <div className="mt-3">
              <SidebarLogoutButton />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
