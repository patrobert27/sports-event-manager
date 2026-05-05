// 1. Imports de biblioteques (React, Redux, Router)
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// 2. Imports d'accions de Redux (Auth i Competition)
import { logout } from "../features/auth/authSlice";
import { fetchUserProfile } from "../features/auth/authThunks";
import { loadCompetitions } from "../features/competition/competitionThunks";

// 3. Imports de selectors de Redux
import { 
  selectAuth, 
  selectIsLoadingUser 
} from "../features/auth/authSelectors";
import { 
  selectCompetitions, 
  selectIsLoadingCompetitions 
} from "../features/competition/competitionSelectors";

// 4. Imports de components UI
import CompetitionList from "../features/competition/components/CompetitionList";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";
import { ErrorAlert } from "../components/ui/Alerts";

/**
 * PÀGINA PRINCIPAL (DASHBOARD)
 * 
 * Aquesta és la pantalla que veu l'usuari un cop ha iniciat sessió.
 * Mostra les jornades esportives que estan actives actualment.
 */
export default function PrincipalPage() {
  // --- 2. Hooks ---
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Obtenim l'usuari i els estats de càrrega de Redux
  const { user } = useSelector(selectAuth);
  const isLoadingUser = useSelector(selectIsLoadingUser);
  const competitions = useSelector(selectCompetitions);
  const isLoadingCompetitions = useSelector(selectIsLoadingCompetitions);
  
  // Estat local per gestionar errors de càrrega
  const [error, setError] = useState(null);


  // --- 3. Variables derivades ---
  
  // Filtrem la llista per mostrar només les jornades que no han finalitzat
  const activeCompetitions = competitions.filter((singleCompetition) => {
    const isNotFinished = singleCompetition.status !== "FINISHED";
    return isNotFinished;
  });

  const activeCountMessage = `${activeCompetitions.length} en curs`;


  // --- 4. Efectes (Side Effects) ---

  /**
   * Efecte: Carregar el perfil de l'usuari
   * Si hem entrat a la pàgina però no tenim les dades de l'usuari (per exemple,
   * en refrescar el navegador), les tornem a demanar al backend.
   */
  useEffect(() => {
    // Si no hi ha usuari i no s'està carregant ja...
    const needsToLoadProfile = !user && !isLoadingUser;

    if (needsToLoadProfile) {
      const loadProfileData = async () => {
        try {
          // Cridem al thunk que demana el perfil
          await dispatch(
            fetchUserProfile()
          );
        } catch (err) {
          // Si falla, guardem el missatge d'error per mostrar-lo a l'usuari
          setError(err.message);
        }
      };

      loadProfileData();
    }
  }, [user, isLoadingUser, dispatch]);

  /**
   * Efecte: Carregar les competicions
   * Aquest efecte s'executa un sol cop en muntar la pàgina per portar
   * totes les jornades de la base de dades cap a Redux.
   */
  useEffect(() => {
    dispatch(
      loadCompetitions()
    );
  }, [dispatch]);


  // --- 5. Funcions / Handlers ---

  /**
   * Tanca la sessió de l'usuari i el torna a la pantalla de login.
   */
  const handleLogout = () => {
    // 1. Esborrem el token i les dades de Redux
    dispatch(
      logout()
    );
    
    // 2. Redirigim l'usuari cap a fora
    navigate(
      "/login", 
      { 
        replace: true 
      }
    );
  };


  // --- 6. Renderitzats condicionals (Pantalles de càrrega i error) ---

  // Si encara estem identificant l'usuari, mostrem el Spinner a tota pantalla
  if (isLoadingUser) {
    return (
      <Spinner 
        message="Carregant el teu perfil..." 
      />
    );
  }

  // Si hi ha hagut un error crític carregant l'usuari
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <ErrorAlert 
            message={error} 
          />
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 bg-primary text-white px-6 py-2 rounded-xl font-semibold hover:bg-primary-hover transition cursor-pointer"
        >
          Tornar a iniciar sessió
        </button>
      </div>
    );
  }


  // --- 7. Render principal (JSX) ---

  return (
    <div className="space-y-8">
      
      {/* Estructura de graella: 2 columnes per contingut, 1 lateral per resum */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            {/* Capçalera de la secció amb el comptador */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark">
                Jornades actives
              </h2>
              <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                {activeCountMessage}
              </span>
            </div>

            {/* Contingut segons l'estat de càrrega de les competicions */}
            {isLoadingCompetitions ? (
              <Spinner 
                message="Carregant la llista de jornades..." 
              />
            ) : activeCompetitions.length === 0 ? (
              <EmptyState />
            ) : (
              <CompetitionList 
                competitions={activeCompetitions} 
              />
            )}
          </section>

        </div>

        {/* Columna Lateral (Sidebar) */}
        <aside className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm">
            <h3 className="font-bold text-dark mb-4">
              Resum del dia
            </h3>
            <p className="text-sm text-muted">
              Benvingut al panell de control de les Jornades Esportives de l'Institut Joaquim Mir.
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
}
