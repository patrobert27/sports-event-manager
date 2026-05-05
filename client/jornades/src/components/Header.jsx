import { useSelector } from "react-redux";
import { selectAuth } from "../features/auth/authSelectors";

// Capçalera superior de l'aplicació
export default function Header({ onToggleSidebar }) {
  // Obtenim les dades de l'usuari actual des de Redux
  const { user } = useSelector(selectAuth);

  return (
    <header className="bg-gradient-to-r from-primary to-dark">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Botó per obrir el menú lateral en pantalles petites */}
          <button
            aria-label="Open navigation"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg bg-white/10 text-white mr-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white">Jornades</h1>
          </div>
        </div>

        {/* Informació de l'usuari a la part dreta */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-white/70 text-sm">Benvingut/da</p>
            <h2 className="text-1xl font-bold text-white">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-white/70 text-sm mt-0.5">{user?.email} - {user?.role?.name || 'estudiant'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
