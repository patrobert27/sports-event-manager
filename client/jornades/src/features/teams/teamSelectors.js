import { createSelector } from '@reduxjs/toolkit';
import { ADMIN_VARIANTS } from '../../constants/roles';

// --- SELECTORS BASE ---

const selectTeamsState = (state) => {
  return state.teams;
};

const selectAuthState = (state) => {
  return state.auth;
};

const selectCompetitionState = (state) => {
  return state.competition;
};


// --- SELECTORS SIMPLES (Dades directes de l'store) ---

// agafem tota la llista de equips guardada al slice
export const selectTeams = createSelector(
  [selectTeamsState],
  (teamsState) => {
    return teamsState.teams || [];
  }
);

// agafem l'equip del qual estem mirant el detall o gestionant membres
export const selectCurrentTeam = createSelector(
  [selectTeamsState],
  (teamsState) => {
    return teamsState.currentTeam;
  }
);

// indica si estem descarregant equips de la base de dades
export const selectIsLoadingTeams = createSelector(
  [selectTeamsState],
  (teamsState) => {
    return teamsState.isLoadingTeams;
  }
);

// errors de peticions de la feature d'equips
export const selectTeamsError = createSelector(
  [selectTeamsState],
  (teamsState) => {
    return teamsState.error;
  }
);

// missatges de tot correcte de l'equip
export const selectTeamsSuccess = createSelector(
  [selectTeamsState],
  (teamsState) => {
    return teamsState.success;
  }
);


// --- SELECTORS DE COMPETICIÓ ---

// agafem la competicio activa que tenim carregada al frontend
export const selectCurrentCompetitionFromTeams = createSelector(
  [selectCompetitionState],
  (compState) => {
    return compState.currentCompetition;
  }
);

// aquesta logica decideix si les inscripcions a la jornada estan obertes
export const selectIsRegistrationOpen = createSelector(
  [selectCurrentCompetitionFromTeams],
  (competition) => {
    
    // si no hi ha competicio o no esta en fase de registre, tancat segur
    if (!competition || competition.status !== 'REGISTRATION') {
      return false;
    }

    const now = new Date();
    
    const registrationStart = competition.registration_start
      ? new Date(competition.registration_start)
      : null;
      
    const registrationDeadline = competition.registration_deadline
      ? new Date(competition.registration_deadline)
      : null;

    // comprovem si encara és massa d'hora o si ja s'ha passat el termini
    if (registrationStart && registrationStart > now) {
      return false;
    }
    
    if (registrationDeadline && registrationDeadline < now) {
      return false;
    }

    return true;
  }
);

// mirem si encara no s'ha obert la veda per registrar equips
export const selectIsTooEarlyToRegister = createSelector(
  [selectCurrentCompetitionFromTeams],
  (competition) => {
    
    if (!competition?.registration_start) {
      return false;
    }
    
    const isEarly = new Date(competition.registration_start) > new Date();
    
    return isEarly;
  }
);

// ens retorna com està la competició en aquest moment
export const selectCompetitionStatus = createSelector(
  [selectCurrentCompetitionFromTeams],
  (competition) => {
    return competition?.status || null;
  }
);

// comprova si el torneig ja s'ha acabat del tot
export const selectIsCompetitionFinished = createSelector(
  [selectCompetitionStatus],
  (status) => {
    const isFinished = status === 'FINISHED';
    
    return isFinished;
  }
);


// --- SELECTORS D'EQUIPS FILTRATS ---

// agafem els equips que participen nomes en aquesta competicio en concret
export const selectTeamsByCompetition = createSelector(
  [selectTeams, (state, competitionId) => {
    return competitionId;
  }],
  (teams, competitionId) => {
    
    if (!competitionId) {
      return teams;
    }
    
    const targetId = Number(competitionId);
    
    const matchedTeams = teams.filter((t) => {
      const compId = t.competition?.id || t.competition_id;
      return Number(compId) === targetId;
    });
    
    return matchedTeams;
  }
);


// --- SELECTORS D'USUARI I PERMISOS ---

// agafem les dades del perfil de l'usuari connectat
export const selectCurrentUser = createSelector(
  [selectAuthState],
  (authState) => {
    return authState.user;
  }
);

// retorna el nom del rol normalitzat per fer comparacions sense por a les majúscules
export const selectCurrentUserRole = createSelector(
  [selectCurrentUser],
  (user) => {
    const roleString = (user?.role?.name || '').toString().toLowerCase();
    
    return roleString;
  }
);

// indica si l'usuari que esta mirant la web és un administrador general
export const selectIsCurrentUserAdmin = createSelector(
  [selectCurrentUserRole],
  (roleName) => {
    const isAdmin = ADMIN_VARIANTS.includes(roleName);
    
    return isAdmin;
  }
);

// aquesta logica decideix si l'usuari pot gestionar membres i quina relacio te amb l'equip
export const selectUserTeamRole = createSelector(
  [selectCurrentTeam, selectCurrentUser, selectIsCurrentUserAdmin],
  (team, user, isAdmin) => {
    
    if (!team || !user) {
      return { 
        isCaptain: false, 
        isTutor: false, 
        isAdmin: isAdmin, 
        canManage: isAdmin 
      };
    }

    const isCaptain = team.captain?.id === user.id;
    const isTutor = team.teacher?.id === user.id;
    const canManage = isCaptain || isTutor || isAdmin;

    return { 
      isCaptain, 
      isTutor, 
      isAdmin, 
      canManage 
    };
  }
);

// indica si es pot editar el logo o el nom de l'equip actual
export const selectCanEditTeam = createSelector(
  [selectUserTeamRole, selectIsRegistrationOpen, selectIsCompetitionFinished],
  (roles, isRegOpen, isFinished) => {
    const { isCaptain, isTutor, isAdmin } = roles;
    
    const allowed = isAdmin || (isCaptain && isRegOpen) || (isTutor && !isFinished);
    
    return allowed;
  }
);


// --- SELECTORS DE MEMBRES ---

// demana la llista d'alumnes que s'han volgut apuntar però encara no estan confirmats
export const selectPendingMembers = createSelector(
  [selectCurrentTeam],
  (team) => {
    const pending = team?.players?.filter((p) => {
      return !p.confirmed;
    }) || [];
    
    return pending;
  }
);

// demana els jugadors titulars i confirmats de l'equip actual
export const selectAcceptedMembers = createSelector(
  [selectCurrentTeam],
  (team) => {
    const accepted = team?.players?.filter((p) => {
      return p.confirmed;
    }) || [];
    
    return accepted;
  }
);

// busca si l'usuari té una sol·licitud d'unió pendent a l'equip que està mirant
export const selectUserPendingRecord = createSelector(
  [selectCurrentTeam, selectCurrentUser],
  (team, user) => {
    
    if (!team || !user) {
      return null;
    }
    
    const record = team.players?.find((p) => {
      return p.user?.id === user.id && !p.confirmed;
    }) || null;
    
    return record;
  }
);

// mirem si l'usuari ja esta en algun equip de la jornada per bloquejar el boto d'unir-se o crear
export const selectUserInAnyTeam = createSelector(
  [
    (state, competitionId) => {
      return selectTeamsByCompetition(state, competitionId);
    },
    (state, competitionId, userId) => {
      return userId;
    }
  ],
  (teams, userId) => {
    const userExists = teams.some((t) => {
      return t.players?.some((p) => {
        return p.user?.id === userId && p.confirmed;
      });
    });
    
    return userExists;
  }
);

// decideix si ensenyem el botó verd de "Sol·licitar Unió" o el bloquegem
export const selectCanRequestJoin = createSelector(
  [
    selectIsRegistrationOpen,
    (state, competitionId) => {
      return selectUserInAnyTeam(state, competitionId, state.auth.user?.id);
    },
    selectUserPendingRecord
  ],
  (isRegOpen, userInTeam, pendingRecord) => {
    const canRequest = isRegOpen && !userInTeam && !pendingRecord;
    
    return canRequest;
  }
);
