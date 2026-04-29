import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setToken } from "../features/auth/authSlice";
import { selectIsAuthenticated } from "../features/auth/authSelectors";
import authService from "../features/auth/authService";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Si ya está autenticado, redirigir a /jornades
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/jornades", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Capturar token de la URL tras el callback de Google
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      dispatch(setToken(token));
      navigate("/jornades", { replace: true });
    }
  }, [searchParams, dispatch, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleLoginUrl();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Card de login */}
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-dark tracking-tight">
            Jornades
          </h1>
          <p className="text-muted mt-2 text-sm">
            Inicia sessió per continuar
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-primary/5 border border-primary/10 p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-dark">Benvingut/da</h2>
              <p className="text-muted text-sm mt-1">
                Accedeix amb el teu compte de Google
              </p>
            </div>

            {/* Separador decorativo */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-primary/10"></div>
              <span className="text-xs text-muted uppercase tracking-wider">
                OAuth 2.0
              </span>
              <div className="flex-1 h-px bg-primary/10"></div>
            </div>

            {/* Botón Google */}
            <button
              id="google-login-btn"
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-primary/20 text-dark font-semibold rounded-xl px-6 py-3.5 hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-200 cursor-pointer group"
            >
              {/* Google icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                Iniciar sessió amb Google
              </span>
            </button>

            {/* Info */}
            <p className="text-center text-xs text-muted">
              Les teves dades estan protegides amb{" "}
              <span className="text-success font-medium">OAuth 2.0</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted mt-6">
          Jornades Esportives © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
