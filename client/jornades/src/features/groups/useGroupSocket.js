import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import { loadGroupStageData } from './groupThunks';
import { loadCompetitionById } from '../competition/competitionThunks';

/**
 * useGroupSocket
 * 
 * Hook per gestionar els events de socket relacionats amb la fase de grups i partits.
 * 
 * @param {string|number} competitionId - ID de la competició activa
 */
export const useGroupSocket = (competitionId) => {
  const socket = useSocket();
  const dispatch = useDispatch();

  const refreshData = useCallback(() => {
    if (competitionId) {
      dispatch(loadGroupStageData(competitionId));
      dispatch(loadCompetitionById(competitionId));
    }
  }, [dispatch, competitionId]);

  useEffect(() => {
    if (!socket || !competitionId) return;

    // Escoltarem els events que indiquen canvis en la fase competitiva
    socket.on('groups:generated', refreshData);
    socket.on('matches:generated', refreshData);
    socket.on('match:result:updated', refreshData);
    socket.on('phase:advanced', refreshData);
    socket.on('competition:finished', refreshData);

    return () => {
      socket.off('groups:generated', refreshData);
      socket.off('matches:generated', refreshData);
      socket.off('match:result:updated', refreshData);
      socket.off('phase:advanced', refreshData);
      socket.off('competition:finished', refreshData);
    };
  }, [socket, competitionId, refreshData]);
};
