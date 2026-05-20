import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectAuth } from "../features/auth/authSelectors";
import UserAvatar from "./ui/UserAvatar";

// Capçalera superior de l'aplicació
export default function Header({ onToggleSidebar }) {

  // Obtenim les dades de l'usuari actual des de Redux
  const { user } = useSelector(selectAuth);
  const { unreadCount } = useSelector((state) => state.announcement);

  // Construïm el nom complet de l'usuari de forma segura
  const fullName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : "Usuari";

  return (
    <header className="bg-gradient-to-r from-primary to-dark">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Part esquerra: botó de menú + títol de l'app */}
        <div className="flex items-center gap-3 min-w-0">

          {/* Botó per obrir el menú lateral en pantalles petites */}
          <button
            aria-label="Open navigation"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg bg-white/10 text-white mr-2 shrink-0"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-bold text-white shrink-0">Jornades</h1>
          </div>
        </div>

        {/* Part dreta: icona de comunicats + info de l'usuari */}
        {/* IMPORTANT: min-w-0 evita que el flex-child es desbordí en mòbil petit */}
        <div className="flex items-center gap-3 min-w-0">

          {/* Icona de comunicats amb badge de no llegits */}
          <Link
            to="/jornades/comunicats"
            className="relative p-2 text-white/80 hover:text-white transition-all hover:scale-110 shrink-0"
            title="Comunicats"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {/* Badge de comunicats no llegits */}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
              </span>
            )}
          </Link>

          {/* Bloc d'informació de l'usuari */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Info textual: amagada en mòbil i visible a partir de sm */}
            <div className="hidden sm:block text-right min-w-0">
              <p className="text-white/60 text-[10px]">Benvingut/da</p>
              
              {/* Nom de l'usuari: truncate evita overflow si el nom és molt llarg */}
              <h2 className="text-sm font-bold text-white leading-none truncate max-w-[150px]">
                {fullName}
              </h2>
              
              {/* Email i rol: truncate + max-w limiten l'amplada per evitar scroll horitzontal */}
              <p className="text-white/50 text-[9px] mt-1 truncate max-w-[150px]">
                {user?.email}
              </p>
            </div>

            {/* Secció visual compacta: Avatar + Crèdits + Rol */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Badge de Rol (Admin / Professor / Alumne, etc.) */}
              {user?.role?.name && (
                <span className="text-[8px] bg-white/10 border border-white/10 text-white font-black px-2 py-1 rounded-xl uppercase tracking-wider leading-none shadow-sm">
                  {user.role.name}
                </span>
              )}

              <div className="bg-white/10 backdrop-blur-sm border border-white/5 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                <span className="text-accent font-black text-xs leading-none">
                  {user?.credits || 0}
                </span>
                <span className="text-white/60 text-[8px] font-bold uppercase tracking-wider hidden sm:inline leading-none">
                  Crèdits
                </span>
                <span className="text-white/60 text-[10px] font-bold leading-none sm:hidden" title="Crèdits">
                  🪙
                </span>
              </div>

              <UserAvatar user={user} size={36} />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
