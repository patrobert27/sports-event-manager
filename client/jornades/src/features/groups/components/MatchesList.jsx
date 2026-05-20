import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Edit2, Clock, CheckCircle2, CheckCircle, Trophy } from 'lucide-react';

import RoleRule from '../../../components/auth/RoleRule';
import MatchResultModal from './MatchResultModal';
import PredictionModal from '../../predictions/components/PredictionModal';
import { updateMatchResult } from '../groupThunks';
import { predictionService } from '../../predictions/predictionService';
import { loadMyPredictions, loadBettingStatus } from '../../predictions/predictionThunks';
import { setUser } from '../../auth/authSlice';
import { apiFetch } from '../../../services/api';
import { selectCurrentCompetition } from '../../competition/competitionSelectors';
import {
  selectAllMatches,
  selectIsLoadingGroups,
} from '../groupSelectors';
import { selectPredictions, selectPredictionError } from '../../predictions/predictionSelectors';
import { setSuccess, clearMessages } from '../../predictions/predictionSlice';
import { SuccessAlert, ErrorAlert } from '../../../components/ui/Alerts';

// noms de les fases en catala per a la UI
const PHASE_LABELS = {
  GROUP_STAGE: 'Fase de Grups',
  SEMIFINAL: 'Semi',
  FINAL: 'Final',
  THIRD_PLACE: '3r i 4t',
};

export default function MatchesList() {
  const { id: competitionId } = useParams();
  const dispatch = useDispatch();

  // dades de redux per a demanar la info dels partits
  const isLoading = useSelector(selectIsLoadingGroups);
  const matches = useSelector(selectAllMatches);
  const competition = useSelector(selectCurrentCompetition);
  const predictions = useSelector(selectPredictions);
  const error = useSelector(selectPredictionError);
  const success = useSelector(state => state.predictions.success);
  const isBettingOpen = useSelector(state => state.predictions.isBettingOpen);

  // modals per a editar o apostar
  const [editingMatch, setEditingMatch] = useState(null);
  const [predictingMatch, setPredictingMatch] = useState(null);
  const [isSavingPrediction, setIsSavingPrediction] = useState(false);

  // aixo es per a que el LIVE es vagi actualitzant sol cada minut i no es quedi congelat
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    // posem un timer per actualitzar l'hora cada minut aixi la pestanya del live no es clava
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // demanem prediccions i estat d'apostes al entrar. si no ho demanem, l'estudiant no sap quins credits te
  useEffect(() => {
    dispatch(loadMyPredictions(competitionId));
    dispatch(loadBettingStatus());
  }, [dispatch, competitionId]);

  // netegem avisos als 3 segons per no molestar, que si no l'alerta verda es queda a la pantalla per sempre
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  // si no hi ha partits fets no pintem res, ja que donaria error de map al render
  if (matches.length === 0) {
    return null;
  }

  // per saber rapid si ja hem apostat en un partit i ensenyar el badge d'apostat
  const betMatchIds = new Set(predictions.map(p => p.match?.id || p.match_id));

  // guardar resultat del partit (admin o profe). aixo crida a l'api i canvia el status
  const handleSave = async (data) => {
    try {
      await dispatch(updateMatchResult(competitionId, editingMatch.id, data));
      setEditingMatch(null);
    } catch {
      // l'error ja es guarda al state de Redux, aixi que no cal fer alert
    }
  };

  // guardar prediccio de l'estudiant. vigilar que els credits es restin be
  const handlePredictionSave = async (data) => {
    setIsSavingPrediction(true);
    
    try {
      await predictionService.createPrediction(
        data.matchId,
        data.goals_local,
        data.goals_visitor,
        data.bet_amount,
      );
      
      setPredictingMatch(null);
      dispatch(setSuccess('Predicció realitzada amb èxit! Bona sort!'));

      // tornem a carregar prediccions i perfil per actualitzar els credits al header
      dispatch(loadMyPredictions(competitionId));
      const updatedUser = await apiFetch('/auth/profile');
      dispatch(setUser(updatedUser.user));
    } catch (err) {
      dispatch(setSuccess(null));
      alert(err.message);
    } finally {
      setIsSavingPrediction(false);
    }
  };

  // ordenem partits per hora i despres per pista per a que quedin ben posats a la graella cronologica
  const sortedMatches = [...matches].sort((a, b) => {
    const dateA = new Date(a.start_time).getTime();
    const dateB = new Date(b.start_time).getTime();

    if (dateA !== dateB) {
      return dateA - dateB;
    }

    return a.court_number - b.court_number;
  });

  // agrupem partits per hora (ex: "10:30"). aixo es per poder pintar un bloc per cada franja
  const slots = {};
  sortedMatches.forEach(match => {
    const hora = new Date(match.start_time).toLocaleTimeString('ca-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (!slots[hora]) {
      slots[hora] = [];
    }

    slots[hora].push(match);
  });

  // ordenem les hores de menys a mes aixi el primer partit surt a dalt
  const sortedHours = Object.keys(slots).sort();

  return (
    <div className="space-y-10">

      {/* avisos d'error i d'exit */}
      <div>
        <SuccessAlert message={success} />
        <ErrorAlert message={error} />
      </div>

      {/* llista de partits per hora */}
      {sortedHours.map((hora) => (
        <div key={hora} className="pb-8">

          {/* hora */}
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-primary w-4 h-4 shrink-0" />
            <span className="text-base sm:text-lg font-black text-dark tracking-tight">{hora}</span>
          </div>

          {/* partits d'aquesta hora agrupats per jornada */}
          <div className="space-y-6">
            {renderMatchesBySubGroup(slots[hora], {
              competition,
              currentTime,
              betMatchIds,
              isBettingOpen,
              setEditingMatch,
              setPredictingMatch,
            })}
          </div>
        </div>
      ))}

      {/* modal per posar resultats */}
      {editingMatch && (
        <MatchResultModal
          match={editingMatch}
          onSave={handleSave}
          onClose={() => setEditingMatch(null)}
          isLoading={isLoading}
        />
      )}

      {/* modal per fer l'aposta */}
      {predictingMatch && (
        <PredictionModal
          match={predictingMatch}
          onSave={handlePredictionSave}
          onClose={() => setPredictingMatch(null)}
          isLoading={isSavingPrediction}
        />
      )}
    </div>
  );
}

// agrupa els partits de la mateixa hora per "Jornada X" o "Semifinal". aixo ajuda a saber quina fase es juga
function renderMatchesBySubGroup(matches, props) {
  const {
    betMatchIds,
    isBettingOpen,
    setEditingMatch,
    setPredictingMatch,
    competition,
    currentTime,
  } = props;

  const subGroups = {};
  
  matches.forEach(m => {
    let label = PHASE_LABELS[m.phase] || m.phase;

    // si es fase de grups, posem Jornada i el numero per a diferenciar-les
    if (m.phase === 'GROUP_STAGE' && m.round_number) {
      label = `Jornada ${m.round_number}`;
    }

    if (!subGroups[label]) {
      subGroups[label] = [];
    }

    subGroups[label].push(m);
  });

  return Object.keys(subGroups).map(label => (
    <div key={label} className="space-y-3">

      {/* titol de la jornada amb linia */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted/60">
          {label}
        </span>
        <div className="h-[1px] flex-1 bg-gray-50" />
      </div>

      {/* llista de cards de partits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {subGroups[label].map(match => (
          <MatchCard
            key={match.id}
            match={match}
            competition={competition}
            currentTime={currentTime}
            hasBet={betMatchIds.has(match.id)}
            isBettingOpen={isBettingOpen}
            onEdit={() => setEditingMatch(match)}
            onPredict={() => setPredictingMatch(match)}
          />
        ))}
      </div>
    </div>
  ));
}

// la card de cada partit
function MatchCard({ match, competition, currentTime, onEdit, onPredict, hasBet, isBettingOpen }) {

  // calculem quan acaba el partit sumant la durada. aixo serveix per treure el live despres
  const matchDate = match.start_time ? new Date(match.start_time) : null;
  const durationMinutes = competition?.match_duration || 30;
  const matchEndDate = matchDate
    ? new Date(matchDate.getTime() + durationMinutes * 60000)
    : null;

  // el backend fa servir "finished" per sapiguer si el partit ja s'ha tancat del tot
  const isFinished = match.status === 'FINISHED' || match.finished;

  // el LIVE es visual i depen de si l'hora actual està dins del rang de joc i no s'ha marcat finished al server
  const isLive = (
    matchDate &&
    !isNaN(matchDate.getTime()) &&
    !match.finished &&
    currentTime >= matchDate &&
    currentTime <= matchEndDate
  );

  return (
    <div
      className={`bg-white rounded-2xl border ${
        hasBet ? 'border-accent/30 shadow-accent/5' : 'border-gray-100'
      } shadow-sm hover:shadow-md transition-all group overflow-hidden relative`}
    >

      {/* cartellet de ja apostat per a saber on tens posats els credits */}
      {hasBet && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-accent text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-tighter shadow-sm flex items-center gap-0.5">
            <CheckCircle size={8} />
            Predit
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 gap-3">

        {/* capçalera per a pantalles mobils */}
        <div className="flex items-center justify-between sm:hidden border-b border-gray-50 pb-2 mb-1">

          {/* pista i estat */}
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-primary/5 rounded-md">
              <span className="text-[10px] font-black text-primary">P{match.court_number}</span>
            </div>
            {isFinished ? (
              <CheckCircle2 size={14} className="text-green-500" />
            ) : (
              <span className="text-[9px] font-bold text-muted/60 uppercase">
                {PHASE_LABELS[match.phase]}
              </span>
            )}
          </div>

          {/* botons d'aposta i editar en mobil */}
          <div className="flex items-center gap-2">
            {!isFinished && isBettingOpen && (
              <button
                onClick={onPredict}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  hasBet ? 'text-accent bg-accent/20' : 'text-accent bg-accent/10'
                }`}
              >
                <Trophy size={12} />
                <span>Predicció</span>
              </button>
            )}
            <RoleRule allowedRoles={['admin', 'professor']}>
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg text-primary bg-primary/10"
              >
                <Edit2 size={12} />
              </button>
            </RoleRule>
          </div>
        </div>

        {/* pista i estat en ordinador */}
        <div className="hidden sm:flex w-12 shrink-0 flex-col items-center border-r border-gray-50 pr-3">
          <span className="text-[10px] font-black text-primary uppercase">P{match.court_number}</span>
          {isFinished ? (
            <CheckCircle2 size={18} className="text-green-500 mt-1" />
          ) : (
            <span className="text-[8px] font-bold text-muted/60 uppercase mt-1 text-center leading-tight">
              {PHASE_LABELS[match.phase]}
            </span>
          )}
        </div>

        {/* equips i marcador */}
        <div className="flex-1 flex items-center justify-between gap-2 sm:gap-4 min-w-0">

          {/* local */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3 min-w-0">
            <div className="flex flex-col items-end min-w-0">
              <span className="font-bold text-xs sm:text-sm text-dark truncate w-full text-right">
                {match.team_local?.name || 'Equip eliminat'}
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-muted/70 uppercase tracking-widest leading-none">
                {match.team_local?.code || '-'}
              </span>
            </div>
            <TeamShield team={match.team_local} />
          </div>

          {/* gols o vs (amb fix responsive perque no fassi salts) */}
          <div className="w-12 sm:w-16 flex flex-col items-center justify-center shrink-0 min-h-[40px]">

            {/* marcador o VS. si el partit està finalitzat o en live s'ensenyen els gols */}
            {(isFinished || isLive) ? (
              <div className="flex items-center gap-1">
                <span
                  className={`text-base sm:text-lg font-black tabular-nums ${
                    match.goals_local > match.goals_visitor ? 'text-dark' : 'text-muted/50'
                  }`}
                >
                  {match.goals_local}
                </span>
                <span className="text-muted/20 font-bold">—</span>
                <span
                  className={`text-base sm:text-lg font-black tabular-nums ${
                    match.goals_visitor > match.goals_local ? 'text-dark' : 'text-muted/50'
                  }`}
                >
                  {match.goals_visitor}
                </span>
              </div>
            ) : (
              <span className="text-[10px] font-black text-muted/20 uppercase tracking-tighter">
                VS
              </span>
            )}

            {/* badge de en joc */}
            {isLive && (
              <span className="text-[8px] font-bold text-green-500 uppercase animate-pulse">
                Live
              </span>
            )}
          </div>

          {/* visitant */}
          <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
            <TeamShield team={match.team_visitor} />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs sm:text-sm text-dark truncate w-full">
                {match.team_visitor?.name || 'Equip eliminat'}
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-muted/70 uppercase tracking-widest leading-none">
                {match.team_visitor?.code || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* botons d'aposta i editar en ordinador */}
        <div className="hidden sm:flex items-center gap-1">
          {!isFinished && isBettingOpen && (
            <button
              onClick={onPredict}
              className={`p-1.5 rounded-lg transition-all active:scale-90 ${
                hasBet
                  ? 'text-accent bg-accent/10'
                  : 'text-muted hover:text-accent hover:bg-accent/5'
              }`}
              title={hasBet ? 'Edita la teva predicció' : 'Fer predicció'}
            >
              <Trophy size={14} />
            </button>
          )}

          <RoleRule allowedRoles={['admin', 'professor']}>
            <button
              onClick={onEdit}
              className="p-2 rounded-xl text-muted/40 hover:text-primary hover:bg-primary/5 transition-all"
            >
              <Edit2 size={12} />
            </button>
          </RoleRule>
        </div>

      </div>
    </div>
  );
}

// mini escut de l'equip o inicial si no en te
function TeamShield({ team }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [team?.shield]);

  return (
    <div className="shrink-0">
      {team?.shield && !imageError ? (
        <img
          src={team.shield}
          onError={() => setImageError(true)}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-gray-100 shadow-sm"
          alt=""
        />
      ) : (
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white text-[9px] sm:text-[10px] font-black shadow-sm"
          style={{ backgroundColor: team?.primary_color || '#334155' }}
        >
          {(team?.name || '?').charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
