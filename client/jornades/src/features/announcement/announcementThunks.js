import announcementService from "./announcementService";

import { 
  setAnnouncements, 
  addAnnouncement, 
  removeAnnouncement,
  setError,
  setSuccess
} from "./announcementSlice";

import { setUser } from "../auth/authSlice";

// demanem els comunicats al backend per omplir la campaneta i la llista
export const loadAnnouncements = () => {
  return async (dispatch) => {
    
    try {
      const data = await announcementService.fetchAnnouncements();
      
      // guardem la llista de comunicats a Redux per a pintar-los
      dispatch(setAnnouncements(data));
      
    } catch (err) {
      console.error('[loadAnnouncements] Error:', err.message);
    }

  };
};

// crea un avís o comunicat general (només per profes/admin)
export const createAnnouncement = (payload) => {
  return async (dispatch) => {
    
    try {
      const created = await announcementService.createAnnouncement(payload);
      
      // ho posem a Redux a l'instant per a que el profe ho vegi al moment sense refrescar
      dispatch(addAnnouncement(created));
      dispatch(setSuccess("Comunicat creat correctament"));
      
      return created;
      
    } catch (err) {
      dispatch(setError(err.message));
      console.error('[createAnnouncement] Error:', err.message);
      
      // llencem l'error cap al formulari per a que sàpiga que ha fallat
      throw err;
    }

  };
};

// elimina un comunicat triat per ID
export const deleteAnnouncement = (id) => {
  return async (dispatch) => {
    
    try {
      await announcementService.deleteAnnouncement(id);
      
      // el traiem del slice de Redux a l'acte
      dispatch(removeAnnouncement(id));
      dispatch(setSuccess("Comunicat eliminat correctament"));
      
    } catch (err) {
      dispatch(setError(err.message));
      console.error('[deleteAnnouncement] Error:', err.message);
      
      throw err;
    }

  };
};

// marquem totes les notificacions com a llegides per netejar la campaneta
export const markAnnouncementsAsRead = () => {
  return async (dispatch, getState) => {
    
    try {
      await announcementService.markAsRead();
      
      const { user } = getState().auth;
      
      // actualitzem el temps de notificacions al perfil local per amagar el puntet vermell
      dispatch(
        setUser({ 
          ...user, 
          last_notif_check: new Date().toISOString() 
        })
      );
      
    } catch (err) {
      console.error('[markAnnouncementsAsRead] Error:', err.message);
    }

  };
};
