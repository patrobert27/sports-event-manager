import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import { 
  addAnnouncement, 
  removeAnnouncement, 
  setUnreadCount 
} from '../features/announcement/announcementSlice';
import { selectAuth } from '../features/auth/authSelectors';
import { useToasts } from '../context/ToastContext';
import { loadAnnouncements } from '../features/announcement/announcementThunks';
import { updateCredits, updatePoints, resetPoints } from '../features/auth/authSlice';
import { setBettingStatus, setRankingVisibility } from '../features/predictions/predictionSlice';


/**
 * useAnnouncements
 * Hook para centralizar la lógica de comunicados en tiempo real.
 */
export const useAnnouncements = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const { user, token } = useSelector(selectAuth);
  const { list } = useSelector(state => state.announcement);

  // 1. Cargar anuncios iniciales usando el Thunk
  useEffect(() => {
    if (token) {
      dispatch(loadAnnouncements());
    }
  }, [dispatch, token]);


  // 2. Escuchar eventos en tiempo real via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleNew = (data) => {
      // Obtenim l'ID del destinatari (pot venir de diverses formes segons TypeORM)
      const targetUserId = data.user_id || data.user?.id;

      // Si el comunicat és privat i no és per a nosaltres, l'ignorem
      if (targetUserId && targetUserId !== user?.id) {
        console.log(`[Socket] Ignorant notificació privada per a usuari ${targetUserId}`);
        return;
      }

      dispatch(addAnnouncement(data));
      // Mostrar la tarjeta (Toast) arriba a la derecha
      addToast('Nou Comunicat', data.title, 'info');
    };

    const handleDelete = (id) => {
      dispatch(removeAnnouncement(parseInt(id)));
    };

    const handleCredits = (data) => {
      console.log(`[Socket] Usuari actualitzat: Credits ${data.credits}, Points ${data.session_points}`);
      if (data.credits !== undefined) dispatch(updateCredits(data.credits));
      if (data.session_points !== undefined) dispatch(updatePoints(data.session_points));
    };

    const handlePointsReset = () => {
      console.log(`[Socket] Punts de sessió resetejats a 0`);
      dispatch(resetPoints());
    };

    const handleStatusChange = (data) => {
      console.log(`[Socket] Estat d'prediccions canviat: ${data.isOpen}`);
      dispatch(setBettingStatus(data.isOpen));
    };

    const handleVisibilityChange = (data) => {
      console.log(`[Socket] Visibilitat rànquing canviada: ${data.isVisible}`);
      dispatch(setRankingVisibility(data.isVisible));
    };

    socket.on('announcement:new', handleNew);
    socket.on('announcement:deleted', handleDelete);
    socket.on('user:credits_updated', handleCredits);
    socket.on('user:points_reset', handlePointsReset);
    socket.on('betting:status_changed', handleStatusChange);
    socket.on('betting:ranking_visibility_changed', handleVisibilityChange);

    return () => {
      socket.off('announcement:new', handleNew);
      socket.off('announcement:deleted', handleDelete);
      socket.off('user:credits_updated', handleCredits);
      socket.off('user:points_reset', handlePointsReset);
      socket.off('betting:status_changed', handleStatusChange);
      socket.off('betting:ranking_visibility_changed', handleVisibilityChange);
    };
  }, [socket, dispatch, user, addToast]);

  // 3. Calcular mensajes no leídos
  useEffect(() => {
    if (!user) return;
    
    // Si no tiene last_notif_check, asumimos una fecha muy antigua
    const lastCheck = user.last_notif_check ? new Date(user.last_notif_check) : new Date(0);
    
    const unread = list.filter(a => new Date(a.created_at) > lastCheck).length;
    dispatch(setUnreadCount(unread));
  }, [list, user, dispatch]);

  return { list };
};
