import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Users, Zap, Calendar, Trophy,
  BarChart2, AlertCircle, Loader2
} from 'lucide-react';

import RoleRule from '../../../components/auth/RoleRule';
import GroupTable from './GroupTable';
import MatchesList from './MatchesList';
import CompetitionTimeline from './CompetitionTimeline';
import CompetitionBrackets from './CompetitionBrackets';

import {
  loadGroupStageData,
  generateGroups,
  generateMatches,
} from '../groupThunks';
import { useGroupSocket } from '../useGroupSocket';

import {
  selectGroups,
  selectStandings,
  selectGroupStageMatches,
  selectSemifinalMatches,
  selectFinalMatches,
  selectIsLoadingGroups,
  selectGroupError,
  selectGroupSuccess,
} from '../groupSelectors';

import { selectCurrentCompetition } from '../../competition/competitionSelectors';
import { setError, setSuccess } from '../groupSlice';

/**
 * GroupStagePanel
 *
 * Mostra la fase de grups i les subpestanyes de resum, calendari i quadre de la competició.
 */
export default function GroupStagePanel() {
  const dispatch = useDispatch();
  const { id } = useParams();

  // estat per a saber quina sub-pestanya tenim oberta a sota de tot
  const [activeSubTab, setActiveSubTab] = useState('resum');

  // dades recuperades de Redux
  const competition = useSelector(selectCurrentCompetition);
  const groups = useSelector(selectGroups);
  const standings = useSelector(selectStandings);
  const gsMatches = useSelector(selectGroupStageMatches);
  const sfMatches = useSelector(selectSemifinalMatches);
  const finalMatches = useSelector(selectFinalMatches);
  const isLoading = useSelector(selectIsLoadingGroups);
  const error = useSelector(selectGroupError);
  const success = useSelector(selectGroupSuccess);

  const status = competition?.status;

  // comprovem si ja ha passat el termini per apuntar equips
  const now = new Date();
  const deadlinePassed = competition?.registration_deadline
    ? new Date(competition.registration_deadline) < now
    : false;

  const user = useSelector(state => state.auth.user);
  const isAdmin = user?.role?.name === 'admin';

  // nomes deixem veure el panell si la competicio ja ha començat, el termini ha vençut, hi ha grups fets o ets admin
  const canShowPanel = status !== 'REGISTRATION' || deadlinePassed || groups.length > 0 || isAdmin;

  // sincronitzacio del grup per websockets en temps real
  useGroupSocket(id);

  // demanem les dades del panell de grups a la base de dades al entrar
  useEffect(() => {
    if (id && canShowPanel) {
      dispatch(loadGroupStageData(id));
    }
  }, [id, canShowPanel, dispatch]);

  // esborrem el missatge d'exit automàticament als 4 segons
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(setSuccess(null));
      }, 4000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [success, dispatch]);

  // esborrem el missatge d'error automàticament als 6 segons
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(setError(null));
      }, 6000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [error, dispatch]);

  // si encara es d'hora i no s'ha tancat el registre, no pintem res
  if (!canShowPanel) {
    return null;
  }

  // variables auxiliars per netejar el JSX i treure condicionals gegants
  const canGenerateGroups = (deadlinePassed || status === 'GROUP_STAGE' || status === 'REGISTRATION') && status !== 'FINISHED';
  
  const canGenerateMatches = status === 'GROUP_STAGE' && groups.length > 0;

  return (
    <section className="space-y-6 px-1 sm:px-2">

      {/* capçalera de la fase competitiva */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <BarChart2 size={16} className="text-primary" />
          </div>
          
          <h2 className="text-lg font-bold text-dark">
            Fase competitiva
          </h2>
        </div>

        {/* botons de gestio exclusius del administrador */}
        <RoleRule allowedRoles={['admin']}>
          <div className="flex gap-2 flex-wrap sm:justify-end">
            
            {canGenerateGroups && (
              <ActionButton
                icon={<Users size={14} />}
                label={groups.length > 0 ? 'Regenerar Grups' : 'Generar Grups'}
                onClick={() => {
                  dispatch(generateGroups(id));
                }}
                isLoading={isLoading}
              />
            )}
            
            {canGenerateMatches && (
              <ActionButton
                icon={<Calendar size={14} />}
                label={gsMatches.length > 0 ? 'Regenerar Partits' : 'Generar Partits'}
                onClick={() => {
                  dispatch(generateMatches(id));
                }}
                isLoading={isLoading}
              />
            )}

          </div>
        </RoleRule>
      </div>

      {/* avisos d'error o d'exit a dalt de tot de la secció */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-danger/5 border border-danger/20 rounded-2xl text-sm text-danger animate-fade-in">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button 
            onClick={() => {
              dispatch(setError(null));
            }} 
            className="text-danger/50 hover:text-danger font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-success/5 border border-success/20 rounded-2xl text-sm text-success animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-success shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 
        selector de sub-pestanyes per a triar què mirar.
        hem posat overflow-x-auto i max-w-full per a que no es tallin en iphones vells.
      */}
      <div className="flex items-center gap-1 p-1 bg-gray-100/50 rounded-2xl w-fit max-w-full overflow-x-auto scrollbar-hide">
        <SubTabButton
          active={activeSubTab === 'resum'}
          onClick={() => {
            setActiveSubTab('resum');
          }}
          label="Resum"
          icon={<BarChart2 size={14} />}
        />
        
        <SubTabButton
          active={activeSubTab === 'timeline'}
          onClick={() => {
            setActiveSubTab('timeline');
          }}
          label="Calendari"
          icon={<Calendar size={14} />}
        />
        
        <SubTabButton
          active={activeSubTab === 'brackets'}
          onClick={() => {
            setActiveSubTab('brackets');
          }}
          label="Quadre"
          icon={<Trophy size={14} />}
        />
      </div>

      {/* render del contingut segons quina pestanya hem triat a dalt */}
      {activeSubTab === 'resum' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* taules de classificació de cada grup esportiu */}
          {standings.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">
                Classificació per Grups
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {standings.map((g) => {
                  return (
                    <GroupTable 
                      key={g.group_id} 
                      group={g} 
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* agenda general cronologica amb la llista de partits */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">
              Agenda de la Competició
            </h3>
            
            <MatchesList />
          </div>

        </div>
      )}

      {activeSubTab === 'timeline' && (
        <div className="animate-fade-in">
          <CompetitionTimeline />
        </div>
      )}

      {activeSubTab === 'brackets' && (
        <div className="animate-fade-in">
          <CompetitionBrackets />
        </div>
      )}

      {/* cartellet per si encara no s'han creat els grups (estat inicial del torneig) */}
      {!isLoading && groups.length === 0 && (
        <div className="text-center py-10 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
          <Users size={28} className="mx-auto text-muted/30 mb-3" />
          <p className="text-sm font-medium text-muted">
            Encara no s'han generat els grups d'aquesta competició.
          </p>
        </div>
      )}

    </section>
  );
}

// boto d'accio per a l'administrador (generar partits o grups)
function ActionButton({ icon, label, onClick, isLoading }) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 shadow-sm transition-all disabled:opacity-60 active:scale-95 cursor-pointer"
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        icon
      )}
      {label}
    </button>
  );
}

// cadascun dels botons del selector de pestanyes
function SubTabButton({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
        active
          ? 'bg-white text-primary shadow-sm'
          : 'text-muted hover:text-dark'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
