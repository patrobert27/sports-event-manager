import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { selectUser } from "../../features/auth/authSelectors";
import { loadBettingStatus } from "../../features/predictions/predictionThunks";
import { ADMIN_VARIANTS } from "../../constants/roles";
import SidebarItem from "./SidebarItem";
import SidebarUserSection from "./SidebarUserSection";
import SidebarLogoutButton from "./SidebarLogoutButton";
import { LayoutDashboard, Trophy, Megaphone, Users, Activity, MapPin, Award, Coins } from "lucide-react";

const DEFAULT_ITEMS = [
  { to: '/jornades', label: 'Jornades', icon: <Trophy size={20} /> },
  { to: '/jornades/ranking', label: 'Rànquing', icon: <Award size={20} /> },
  { to: '/jornades/comunicats', label: 'Comunicats', icon: <Megaphone size={20} /> },
];

export default function AppSidebar({ open = false, onClose, extra = [] }) {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const isBettingOpen = useSelector(state => state.predictions.isBettingOpen);
  const isRankingVisible = useSelector(state => state.predictions.isRankingVisible);
  
  const roleName = (user?.role?.name || "").toString().toLowerCase();
  const isAdmin = ADMIN_VARIANTS.includes(roleName);
  
  const location = useLocation();
  const currentPath = location.pathname;

  // Carregar estat d'apostes al muntar
  useEffect(() => {
    dispatch(loadBettingStatus());
  }, [dispatch]);

  const items = [...DEFAULT_ITEMS].filter(it => {
    // Si és el rànquing, només mostrar si la visibilitat està activa o si ets admin
    if (it.to === '/jornades/ranking') {
      return isRankingVisible || isAdmin;
    }
    return true;
  });

  if (isAdmin) {
    items.push({ to: '/jornades/usuaris', label: 'Usuaris', icon: <Users size={20} /> });
    items.push({ to: '/jornades/activitats', label: 'Activitats', icon: <Activity size={20} /> });
    items.push({ to: '/jornades/camps', label: 'Camps', icon: <MapPin size={20} /> });
    items.push({ to: '/jornades/control-apostes', label: 'Prediccions', icon: <Coins size={20} /> });
  }

  const allItems = [...items, ...extra];

  const isPathActive = (it) => {
    if (!it.to || it.to === '#' || !it.to.startsWith('/')) return false;
    if (currentPath === it.to) return true;

    const itToWithSlash = it.to.endsWith('/') ? it.to : `${it.to}/`;
    const currentPathWithSlash = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;

    if (currentPathWithSlash.startsWith(itToWithSlash)) {
      const hasBetterMatch = allItems.some(other => {
        if (other.to === it.to) return false;
        const otherToWithSlash = other.to.endsWith('/') ? other.to : `${other.to}/`;
        return currentPathWithSlash.startsWith(otherToWithSlash) && other.to.length > it.to.length;
      });
      return !hasBetterMatch;
    }

    return false;
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose} />

      <aside className={`fixed left-0 top-0 bottom-0 z-50 w-64 bg-white p-4 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:sticky md:top-0 md:h-screen md:block md:shadow-none shadow-lg overflow-y-auto`}>
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
                icon={it.icon}
                isActive={isPathActive(it)}>
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
                    icon={it.icon}
                    isActive={isPathActive(it)}>
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
