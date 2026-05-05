// 1. Imports de biblioteques (React, Redux, Router)
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

// 2. Imports d'accions i selectors de Redux
import { setToken } from "../features/auth/authSlice";
import { fetchUserProfile } from "../features/auth/authThunks";
import { selectIsAuthenticated } from "../features/auth/authSelectors";

// 3. Imports de serveis i components UI
import authService from "../features/auth/authService";
import { GoogleIcon } from "../components/ui/icons/GoogleIcon";

// Constants de configuració visual
const SCHOOL_LOGO = "/logos/logo_equip1.png";
const SCHOOL_NAME = "Institut Joaquim Mir";
const APP_TITLE = "Jornades Esportives";

/**
 * PÀGINA DE LOGIN
 * 
 * Aquesta pantalla és la porta d'entrada a l'aplicació.
 * Permet identificar-se a través de Google o mitjançant un login ràpid de desenvolupament.
 */
export default function LoginPage() {
  // --- 2. Hooks ---
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Mirem si l'usuari ja està autenticat consultant l'estat global de Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);


  // --- 3. Variables derivades ---
  
  // Obtenim l'any actual per al peu de pàgina
  const currentYear = new Date().getFullYear();


  // --- 4. Efectes (Side Effects) ---

  /**
   * Efecte: Redirecció automàtica
   * Si l'usuari ja ha fet login, no té sentit que estigui en aquesta pàgina.
   * El portem directament a la pàgina principal de les jornades.
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate(
        "/jornades", 
        { 
          replace: true 
        }
      );
    }
  }, [isAuthenticated, navigate]);

  /**
   * Efecte: Processar el callback de Google
   * Quan Google ens torna el control, ens envia un 'token' per l'URL.
   * Aquest efecte el captura, el guarda i carrega el perfil de l'usuari.
   */
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");

    if (tokenFromUrl) {
      const handleLoginSequence = async () => {
        // 1. Guardem el token a Redux i al localStorage (a través de l'action setToken)
        dispatch(
          setToken(tokenFromUrl)
        );

        // 2. Amb el token ja guardat, demanem al servidor les dades de l'usuari
        await dispatch(
          fetchUserProfile()
        );

        // 3. Un cop tenim el perfil carregat, anem cap a l'interior de l'app
        navigate(
          "/jornades", 
          { 
            replace: true 
          }
        );
      };

      handleLoginSequence();
    }
  }, [searchParams, dispatch, navigate]);


  // --- 5. Funcions / Handlers ---

  /**
   * Envia l'usuari cap a la pàgina de Google per identificar-se.
   */
  const handleGoogleLogin = () => {
    const googleUrl = authService.getGoogleLoginUrl();
    window.location.href = googleUrl;
  };

  /**
   * Funció només per a programadors (mode desenvolupament).
   * Permet entrar posant qualsevol email sense passar per Google.
   */
  const handleDevLogin = async (email) => {
    try {
      // Demanem un token de prova al backend
      const devToken = await authService.devLogin(email);

      // Guardem el token
      dispatch(
        setToken(devToken)
      );

      // Carreguem l'usuari
      await dispatch(
        fetchUserProfile()
      );

      // Entrem a l'app
      navigate(
        '/jornades', 
        { 
          replace: true 
        }
      );
    } catch (err) {
      console.error('El login de desenvolupament ha fallat:', err);
    }
  };


  // --- 6. Render (JSX) ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        
        {/* Capçalera amb el logo de l'institut */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-2xl bg-white mb-6 p-4 shadow-sm border border-primary/10">
            <img 
              src={SCHOOL_LOGO} 
              alt={SCHOOL_NAME} 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            {APP_TITLE}
          </h1>
        </div>

        {/* Targeta del formulari de login */}
        <div className="bg-white rounded-2xl shadow-lg shadow-primary/10 border border-primary/20 p-8">
          <div className="space-y-6">
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-dark">Benvingut/da</h2>
              <p className="mt-1 text-sm text-muted">
                Accedeix amb el teu compte de Google per continuar
              </p>
            </div>

            {/* Botó de login amb Google */}
            <button
              id="google-login-btn"
              type="button"
              onClick={handleGoogleLogin}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/35 transition-all duration-300 hover:scale-105 focus:scale-105 hover:bg-primary-hover focus:bg-primary-hover hover:shadow-2xl focus:shadow-2xl active:scale-95 cursor-pointer outline-none"
            >
              <GoogleIcon />
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                Iniciar sessió amb Google
              </span>
            </button>

            {/* Secció secreta només per a programadors (mode DEV) */}
            {import.meta.env.DEV && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-muted text-center mb-3">
                  Eines de desenvolupament
                </p>
                <div className="flex flex-col gap-2">
                  <input 
                    id="dev-email-input" 
                    type="email" 
                    placeholder="email@exemple.com" 
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const emailValue = document.getElementById('dev-email-input').value;
                      handleDevLogin(emailValue);
                    }}
                    className="w-full bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Login Ràpid (Dev)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Peu de pàgina */}
        <p className="mt-6 text-center text-xs text-muted">
          {SCHOOL_NAME} · {APP_TITLE} © {currentYear}
        </p>
      </div>
    </div>
  );
}
