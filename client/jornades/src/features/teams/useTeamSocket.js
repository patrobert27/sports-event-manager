import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import { setTeams, setTeam } from './teamSlice';
import { loadTeams, loadTeamById } from './teamThunks';
import { loadCompetitionById, loadCompetitions } from '../competition/competitionThunks';

/**
 * useTeamSocket
 * 
 * Hook centralitzat per gestionar tots els events de Socket.io
 * relacionats amb equips i competicions (ja que els equips depenen d'elles).
 * 
 * Responsabilitats:
 * - Escoltar events d'equip: team:created, team:updated, team:deleted, etc.
 * - Escoltar events de competició: competition:updated, competition:deleted.
 * - Actualitzar l'store de Redux amb les dades rebudes.
 * - Cleanup automàtic dels listeners al desmontar.
 * 
 * @param {Object} options
 * @param {string|number} options.competitionId - ID de la competició activa (per refrescar la llista i dades)
 * @param {string|number} options.teamId - ID de l'equip actual (per refrescar el detall, opcional)
 */
export const useTeamSocket = ({ competitionId = null, teamId = null } = {}) => {
  const socket = useSocket();
  const dispatch = useDispatch();

  /**
   * Handler genèric que actualitza tant la llista d'equips com el detall
   * de l'equip si estem mirant-ne un.
   */
  const handleTeamUpdate = useCallback((data) => {
    // Si tenim competitionId, recarreguem la llista d'equips
    if (competitionId) {
      dispatch(loadTeams({ competition_id: competitionId }));
    }

    // Si estem veient un equip concret i és el que s'ha actualitzat,
    // actualitzem directament amb les dades rebudes del socket (optimistic)
    if (teamId && data.team && String(data.teamId) === String(teamId)) {
      dispatch(setTeam(data.team));
    } else if (teamId) {
      // Si estem veient un equip però l'event és d'un altre,
      // recarreguem igualment per si afecta la nostra vista (ex: userInAnyTeam)
      dispatch(loadTeamById(teamId));
    }
  }, [dispatch, competitionId, teamId]);

  /**
   * Handler per l'eliminació d'un equip.
   */
  const handleTeamDeleted = useCallback((data) => {
    if (competitionId) {
      dispatch(loadTeams({ competition_id: competitionId }));
    }

    if (teamId && String(data.teamId) === String(teamId)) {
      dispatch(setTeam(null));
    }
  }, [dispatch, competitionId, teamId]);

  /**
   * Handler per canvis a la competició (status, dates).
   * Vital per recalcular 'isRegistrationOpen' en temps real.
   */
  const handleCompetitionUpdate = useCallback((data) => {
    // Si la competició actualitzada és la que estem mirant, la recarreguem
    if (competitionId && String(data.competitionId) === String(competitionId)) {
      dispatch(loadCompetitionById(competitionId));
      // També refresquem els equips per si el canvi d'estat afecta qui els pot veure
      dispatch(loadTeams({ competition_id: competitionId }));
    }
    
    // Sempre refresquem la llista general de competicions
    dispatch(loadCompetitions());
  }, [dispatch, competitionId]);

  useEffect(() => {
    if (!socket) return;

    // --- Listeners d'Equip ---
    socket.on('team:created', handleTeamUpdate);
    socket.on('team:updated', handleTeamUpdate);
    socket.on('team:deleted', handleTeamDeleted);
    socket.on('team:member:joined', handleTeamUpdate);
    socket.on('team:member:accepted', handleTeamUpdate);
    socket.on('team:member:removed', handleTeamUpdate);
    socket.on('team:member:moved', handleTeamUpdate);
    socket.on('team:captain:transferred', handleTeamUpdate);

    // --- Listeners de Competició ---
    socket.on('competition:updated', handleCompetitionUpdate);
    socket.on('competition:created', () => dispatch(loadCompetitions()));
    socket.on('competition:deleted', () => dispatch(loadCompetitions()));

    // --- Reconnexió ---
    const handleReconnect = () => {
      console.log('🔄 [TeamSocket] Resincronitzant estat després de reconnexió...');
      if (competitionId) {
        dispatch(loadCompetitionById(competitionId));
        dispatch(loadTeams({ competition_id: competitionId }));
      }
      if (teamId) {
        dispatch(loadTeamById(teamId));
      }
      dispatch(loadCompetitions());
    };

    socket.on('reconnect', handleReconnect);

    return () => {
      // Netegem tots els listeners
      socket.off('team:created', handleTeamUpdate);
      socket.off('team:updated', handleTeamUpdate);
      socket.off('team:deleted', handleTeamDeleted);
      socket.off('team:member:joined', handleTeamUpdate);
      socket.off('team:member:accepted', handleTeamUpdate);
      socket.off('team:member:removed', handleTeamUpdate);
      socket.off('team:member:moved', handleTeamUpdate);
      socket.off('team:captain:transferred', handleTeamUpdate);
      socket.off('competition:updated', handleCompetitionUpdate);
      socket.off('competition:created');
      socket.off('competition:deleted');
      socket.off('reconnect', handleReconnect);
    };
  }, [socket, handleTeamUpdate, handleTeamDeleted, handleCompetitionUpdate, competitionId, teamId, dispatch]);
};
