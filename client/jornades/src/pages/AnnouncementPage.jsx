import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth } from '../features/auth/authSelectors';
import ConfirmModal from '../components/ui/ConfirmModal';
import { 
  createAnnouncement, 
  deleteAnnouncement, 
  markAnnouncementsAsRead 
} from '../features/announcement/announcementThunks';
import { setSuccess, setError } from '../features/announcement/announcementSlice';
import { SuccessAlert, ErrorAlert } from '../components/ui/Alerts';

// Componentes de la funcionalidad
import AddAnnouncement from '../features/announcement/components/AddAnnouncement';
import AnnouncementList from '../features/announcement/components/AnnouncementList';

/**
 * AnnouncementPage
 * Contenedor principal para la gestión y visualización de comunicados.
 * Sigue la infraestructura de páginas del proyecto delegando en componentes.
 */
export default function AnnouncementPage() {
  const dispatch = useDispatch();
  const { user, token } = useSelector(selectAuth);
  const { list, error, success } = useSelector(state => state.announcement);
  
  const [activeTab, setActiveTab] = useState('general'); // 'general' o 'personal'
  const isAdmin = user?.role?.name === 'admin';
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
 
  // "Congelem" la data del darrer check al entrar perquè els punts no desapareguin de cop
  const entryCheckDate = useMemo(() => {
    return user?.last_notif_check ? new Date(user.last_notif_check) : new Date(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Càlcul de missatges no llegits per categoria (usant la data congelada)
  const unreadGeneral = list.filter(ann => 
    !ann.user_id && ann.type === 'GLOBAL' && new Date(ann.created_at) > entryCheckDate
  ).length;

  const unreadPersonal = list.filter(ann => 
    (Number(ann.user_id) === Number(user?.id) || Number(ann.user?.id) === Number(user?.id)) && 
    new Date(ann.created_at) > entryCheckDate
  ).length;

  // Filtrar anuncis segons la pestanya
  const filteredList = list.filter(ann => {
    const isGlobal = !ann.user_id && ann.type === 'GLOBAL';
    const isForMe = Number(ann.user_id) === Number(user?.id) || Number(ann.user?.id) === Number(user?.id);

    if (activeTab === 'general') return isGlobal;
    if (activeTab === 'personal') return isForMe;
    return false;
  });

  // Al entrar, marcar como leídos
  useEffect(() => {
    if (token) {
      dispatch(markAnnouncementsAsRead());
    }
  }, [token, dispatch]);

  // Temporitzador per netejar missatges d'èxit
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(setSuccess(null));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleCreate = async (data) => {
    await dispatch(createAnnouncement(data));
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;
    try {
      await dispatch(deleteAnnouncement(announcementToDelete));
      setAnnouncementToDelete(null);
    } catch {
      // Gestionado en thunk
    }
  };

  // Determinar si l'anunci que es vol esborrar és global o personal per al missatge del modal
  const selectedAnnouncement = list.find(a => a.id === announcementToDelete);
  const isDeletingGlobal = selectedAnnouncement && !selectedAnnouncement.user_id;

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 animate-in fade-in duration-500">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-dark">Comunicats</h1>
        
        {/* Selector de Pestanyes */}
        <div className="flex bg-gray-100 p-1 rounded-2xl relative">
          <button 
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'general' ? 'bg-white shadow-sm text-primary' : 'text-muted hover:text-dark'}`}
          >
            Globals
            {unreadGeneral > 0 && (
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-sm shadow-accent/50" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'personal' ? 'bg-white shadow-sm text-primary' : 'text-muted hover:text-dark'}`}
          >
            Personals
            {unreadPersonal > 0 && (
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-sm shadow-accent/50" />
            )}
          </button>
        </div>
      </header>
      
      {error && <ErrorAlert message={error} />}
      {success && <SuccessAlert message={success} />}

      
      {/* Zona de creación (Solo Admin y en pestaña General) */}
      {isAdmin && activeTab === 'general' && (
        <AddAnnouncement onCreate={handleCreate} />
      )}

      {/* Lista de comunicados filtrada */}
      <AnnouncementList 
        announcements={filteredList} 
        onDelete={(id) => setAnnouncementToDelete(id)}
        lastCheck={entryCheckDate}
        currentUserId={user?.id}
        isAdmin={isAdmin}
      />


      {/* Modal per a Comunicats GLOBALS (Només Admin) */}
      {announcementToDelete && isDeletingGlobal && (
        <ConfirmModal
          isOpen={!!announcementToDelete}
          onCancel={() => setAnnouncementToDelete(null)}
          onConfirm={handleDelete}
          title="Eliminar Comunicat Global"
          message="Estàs segur? Aquesta acció eliminarà el comunicat per a TOTS els usuaris del sistema. Aquesta operació és irreversible."
        />
      )}

      {/* Modal per a Comunicats PERSONALS */}
      {announcementToDelete && !isDeletingGlobal && (
        <ConfirmModal
          isOpen={!!announcementToDelete}
          onCancel={() => setAnnouncementToDelete(null)}
          onConfirm={handleDelete}
          title="Eliminar Notificació Personal"
          message="Vols treure aquest avís del teu historial? Només s'eliminarà per a tu."
        />
      )}
    </div>
  );
}
