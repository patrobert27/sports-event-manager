// 1. Imports de biblioteques
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlusCircle } from "lucide-react";

// 2. Imports d'accions i selectors de Redux (Feature: Teams)
import { 
  loadTeams 
} from "../teamThunks";

import { 
  selectTeamsByCompetition, 
  selectIsLoadingTeams, 
  selectTeamsError,
  selectUserInAnyTeam,
  selectTeamsSuccess
} from "../teamSelectors";

import { 
  setError, 
  setSuccess 
} from "../teamSlice";

// 3. Imports de components i constants
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

/**
 * COMPONENT: TeamList
 * 
 * Aquest component gestiona la secció d'equips dins d'una competició.
 * S'encarrega de:
 * 1. Carregar els equips del backend.
 * 2. Comprovar si el període d'inscripció està obert.
 * 3. Mostrar un botó per "Crear Equip" només si l'usuari pot.
 * 4. Pintar les targetes de cada equip (TeamCard).
 */
export default function TeamList({ 
  competitionId 
}) {
  // --- 2. Hooks ---
  
  const dispatch = useDispatch();
  
  // Obtenim l'usuari actual i la competició on som de l'estat global
  const currentUser = useSelector((globalState) => {
    return globalState.auth.user;
  });

  const currentCompetition = useSelector((globalState) => {
    return globalState.competition.currentCompetition;
  });

  // Selectors de la llista d'equips
  const teamsList = useSelector((globalState) => {
    return selectTeamsByCompetition(globalState, competitionId);
  });

  const isLoadingTeams = useSelector(selectIsLoadingTeams);
  const errorMessage = useSelector(selectTeamsError);
  const successMessage = useSelector(selectTeamsSuccess);
  
  // Comprovem si aquest usuari concret ja està en algun equip d'aquesta jornada
  const isUserAlreadyInATeam = useSelector((globalState) => {
    return selectUserInAnyTeam(globalState, competitionId, currentUser?.id);
  });

  // Estat per controlar el modal de creació d'equip
  const [showCreateModal, setShowCreateModal] = useState(false);


  // --- 3. Lògica de control de dates (Inscripció) ---
  
  const now = new Date();

  const registrationStartDate = currentCompetition?.registration_start 
    ? new Date(currentCompetition.registration_start) 
    : null;

  const registrationDeadlineDate = currentCompetition?.registration_deadline 
    ? new Date(currentCompetition.registration_deadline) 
    : null;

  // Comprovacions de temps
  const isTooEarlyToRegister = registrationStartDate && registrationStartDate > now;
  const isTooLateToRegister = registrationDeadlineDate && registrationDeadlineDate < now;
  
  // Només està obert si l'estat és REGISTRATION i estem dins de les dates
  const isRegistrationPeriodOpen = 
    currentCompetition?.status === 'REGISTRATION' && 
    !isTooEarlyToRegister && 
    !isTooLateToRegister;


  // --- 4. Efectes (Side Effects) ---

  /**
   * Quan l'ID de la competició canvia (o entrem per primer cop), 
   * carreguem els equips des del servidor.
   */
  useEffect(() => {
    if (competitionId) {
      dispatch(
        loadTeams({ 
          competition_id: competitionId 
        })
      );
    }

    // Funció de neteja: Quan sortim de la pàgina, esborrem els missatges d'èxit/error
    return () => {
      dispatch(
        setError(null)
      );
      dispatch(
        setSuccess(null)
      );
    };
  }, [dispatch, competitionId]);


  // --- 5. Renderitzats condicionals previs ---

  // Si encara estem carregant la llista per primer cop
  if (isLoadingTeams && teamsList.length === 0) {
    return (
      <Spinner />
    );
  }

  // Si el registre encara no ha començat, els alumnes no poden veure els equips (només els Admins)
  const isUserAdmin = currentUser?.role?.name?.toLowerCase() === 'admin';
  const shouldHideTeamsFromStudent = isTooEarlyToRegister && !isUserAdmin;

  if (shouldHideTeamsFromStudent) {
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


  // --- 6. Render principal (JSX) ---

  return (
    <div className="space-y-6 pb-12">
      
      {/* CAPÇALERA DE LA SECCIÓ D'EQUIPS */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-dark">
            Equips Inscrits
          </h2>
          <p className="text-muted text-sm">
            {teamsList.length} equips estan participant en aquesta jornada
          </p>
        </div>

        {/* Botó per crear equip: Només per a estudiants que no estiguin ja en un equip */}
        <RoleRule 
          allowedRoles={[ROLES.STUDENT]}
        >
          {isRegistrationPeriodOpen && !isUserAlreadyInATeam && (
            <button 
              onClick={() => {
                setShowCreateModal(true);
              }} 
              className="btn-primary flex items-center gap-2"
            >
              <PlusCircle size={20} /> 
              Crear el meu Equip
            </button>
          )}
        </RoleRule>
      </div>

      {/* AVISOS SOBRE EL TERMINI D'INSCRIPCIÓ */}
      {isTooEarlyToRegister && currentCompetition?.status === 'REGISTRATION' && (
        <InfoAlert 
          message={`Les inscripcions oficials obriran el dia ${registrationStartDate.toLocaleDateString("ca-ES", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.`} 
        />
      )}
      
      {!isRegistrationPeriodOpen && !isTooEarlyToRegister && currentCompetition?.status === 'REGISTRATION' && (
        <InfoAlert 
          message="El termini d'inscripció per aquesta jornada ja ha finalitzat." 
        />
      )}

      {/* ALERTES DE FEEDBACK DE REDUX (Errors o Èxits d'operacions anteriors) */}
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

      {/* LLISTAT REAL D'EQUIPS */}
      {teamsList.length === 0 ? (
        <InfoAlert 
          message="Encara no s'ha inscrit cap equip. Sigues el primer!" 
        />
      ) : (
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

      {/* MODAL PER CREAR UN NOU EQUIP */}
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
