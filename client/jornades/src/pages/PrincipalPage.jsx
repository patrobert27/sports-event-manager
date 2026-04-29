import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import { fetchUserProfile } from "../features/auth/authThunks";
import { selectAuth } from "../features/auth/authSelectors";

import { loadCompetitions } from "../features/competition/competitionThunks";
import { selectCompetitions, selectCompetitionLoading } from "../features/competition/competitionSelectors";

import JornadaCard from "../features/competition/components/JornadaCard";
import CompetitionsList from "../features/competition/components/CompetitionsList";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";

export default function PrincipalPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector(selectAuth);
  const competitions = useSelector(selectCompetitions);
  const compLoading = useSelector(selectCompetitionLoading);
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState(null);

  // Obtenir dades de l'usuari des del backend utilitzant thunk
  useEffect(() => {
    if (user) {
      return; // Ja tenim les dades
    }

    const loadProfile = async () => {
      try {
        await dispatch(fetchUserProfile()); // demanem les dades del usuari (ja no passem token)
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, dispatch]);

  // Si l'usuari està disponible, aturem la càrrega
  useEffect(() => {
    if (user) setLoading(false);
  }, [user]);

  // Carregar competicions
  useEffect(() => {
    dispatch(loadCompetitions());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-danger/10 rounded-full">
            <svg className="w-7 h-7 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-dark">Error</h2>
          <p className="text-muted text-sm">{error}</p>
          <button
            onClick={handleLogout}
            className="bg-primary text-white px-6 py-2 rounded-xl font-semibold hover:bg-primary-hover transition cursor-pointer"
          >
            Tornar a iniciar sessió
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Active jornada */}
            <section>
              <h2 className="text-xl font-bold text-dark mb-3">Jornades actives</h2>
              {compLoading ? (
                <div className="bg-white rounded-2xl p-6 shadow border border-primary/10 text-center">Carregant jornades...</div>
              ) : (
                (() => {
                  const activeList = competitions.filter((c) => c.status !== "FINISHED");
                  if (!activeList.length) return <EmptyState />;
                  return (
                    <CompetitionsList
                      jornades={activeList}
                    />
                  );
                })()
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
