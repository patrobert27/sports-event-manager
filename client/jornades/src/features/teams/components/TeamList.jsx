import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlusCircle } from "lucide-react";

import { 
  loadTeams 
} from "../teamThunks";

import { 
  selectTeamsByCompetition, 
  selectIsLoadingTeams, 
  selectTeamsError,
  selectUserInAnyTeam,
  selectTeamsSuccess,
  selectIsRegistrationOpen,
  selectIsTooEarlyToRegister,
  selectIsCurrentUserAdmin,
} from "../teamSelectors";

import { 
  setError, 
  setSuccess 
} from "../teamSlice";

import { useTeamSocket } from "../useTeamSocket";
import TeamCard from "./TeamCard";
import CreateTeamModal from "./CreateTeamModal";
import RoleRule from "../../../components/auth/RoleRule";
import Spinner from "../../../components/ui/Spinner";

import { 
  SuccessAlert, 
  ErrorAlert, 
  InfoAlert 
} from "../../../components/ui/Alerts";
import { ROLES } from "../../../constants/roles";

// Aquest component gestiona la secció sencera de llistat d'equips inscrits a la jornada
export default function TeamList({ competitionId }) {
  const dispatch = useDispatch();
  
  // Obtenim l'usuari i la jornada actius de l'estat global de Redux
  const currentUser = useSelector((globalState) => {
    return globalState.auth.user;
  });

  const currentCompetition = useSelector((globalState) => {
    return globalState.competition.currentCompetition;
  });

  // Selectors centralitzats de Redux per a obtenir els equips del torneig
  const teamsList = useSelector((globalState) => {
    return selectTeamsByCompetition(globalState, competitionId);
  });

  const isLoadingTeams = useSelector(selectIsLoadingTeams);
  const errorMessage = useSelector(selectTeamsError);
  const successMessage = useSelector(selectTeamsSuccess);
  const isRegistrationPeriodOpen = useSelector(selectIsRegistrationOpen);
  const isTooEarlyToRegister = useSelector(selectIsTooEarlyToRegister);
  const isUserAdmin = useSelector(selectIsCurrentUserAdmin);
  
  const isUserAlreadyInATeam = useSelector((globalState) => {
    return selectUserInAnyTeam(globalState, competitionId, currentUser?.id);
  });

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Esborrem l'alerta de succés al cap d'uns segons de forma automàtica
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(
          setSuccess(null)
        );
      }, 5000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [successMessage, dispatch]);

  // escoltem canvis de socket per a sincronitzar els equips en temps real (membres, baixes)
  useTeamSocket({ competitionId });

  // Demanem els equips al backend asíncronament quan s'inicia el llistat o canvia la jornada
  useEffect(() => {
    if (competitionId) {
      dispatch(
        loadTeams({ 
          competition_id: competitionId 
        })
      );
    }

    return () => {
      dispatch(
        setError(null)
      );
      dispatch(
        setSuccess(null)
      );
    };
  }, [dispatch, competitionId]);

  if (isLoadingTeams && teamsList.length === 0) {
    return (
      <Spinner />
    );
  }

  // Si és massa d'hora per registrar-se i no és admin, bloquegem el llistat per a que no es copiïn
  const shouldHideTeamsFromStudent = isTooEarlyToRegister && !isUserAdmin;

  if (shouldHideTeamsFromStudent) {
    const registrationStartDate = currentCompetition?.registration_start 
      ? new Date(currentCompetition.registration_start)
      : null;

    const formattedStartDate = registrationStartDate?.toLocaleDateString("ca-ES", { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center space-y-4">
          
          <div className="bg-amber-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
            <PlusCircle size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-dark">
            Inscripcions properament
          </h2>
          
          <p className="text-muted max-w-md mx-auto">
            La secció d'equips estarà disponible a partir del:
            <span className="font-bold text-dark block mt-1">
              {formattedStartDate}
            </span>
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Indicador de capçalera amb el recompte d'equips inscrits */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm gap-4 text-center sm:text-left">
        <div>
          <h2 className="text-2xl font-bold text-dark">
            Equips Inscrits
          </h2>
          <p className="text-muted text-sm">
            {teamsList.length} equips estan participant en aquesta jornada
          </p>
        </div>

        {/* Permet als alumnes lliures crear el seu propi grup si s'està dins de termini */}
        <RoleRule allowedRoles={[ROLES.STUDENT]}>
          {isRegistrationPeriodOpen && !isUserAlreadyInATeam && (
            <button 
              onClick={() => {
                setShowCreateModal(true);
              }} 
              className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <PlusCircle size={20} /> 
              Crear el meu Equip
            </button>
          )}
        </RoleRule>
      </div>

      {/* Si s'està a les inscripcions prèvies de la jornada de lliga */}
      {isTooEarlyToRegister && currentCompetition?.status === 'REGISTRATION' && (
        <InfoAlert 
          message={`Les inscripcions oficials obriran el dia ${new Date(currentCompetition.registration_start).toLocaleDateString("ca-ES", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.`} 
        />
      )}
      
      {!isRegistrationPeriodOpen && !isTooEarlyToRegister && currentCompetition?.status === 'REGISTRATION' && (
        <InfoAlert 
          message="El termini d'inscripció per aquesta jornada ja ha finalitzat." 
        />
      )}

      {/* Missatges globals d'avís de Redux */}
      <div className="space-y-4">
        {successMessage && (
          <SuccessAlert 
            message={successMessage} 
          />
        )}
        {errorMessage && (
          <ErrorAlert 
            message={errorMessage} 
          />
        )}
      </div>

      {teamsList.length === 0 ? (
        <InfoAlert 
          message="Encara no s'ha inscrit cap equip. Sigues el primer!" 
        />
      ) : (
        
        // Quadrícula amb els equips participants de la lligueta
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          
          {teamsList.map((singleTeam) => {
            return (
              <TeamCard 
                key={singleTeam.id} 
                team={singleTeam} 
              />
            );
          })}

        </div>

      )}

      {showCreateModal && (
        <CreateTeamModal 
          competitionId={competitionId}
          onClose={() => {
            setShowCreateModal(false);
          }}
        />
      )}

    </div>
  );
}
