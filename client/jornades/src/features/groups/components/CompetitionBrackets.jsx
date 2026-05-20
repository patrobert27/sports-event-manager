import { useSelector } from 'react-redux';
import { Trophy } from 'lucide-react';
import { 
  selectFinalMatches,
  selectSemifinalMatches,
  selectThirdPlaceMatches
} from '../groupSelectors';

/**
 * CompetitionBrackets — Quadre d'Honor (Podi del torneig)
 * 
 * Mostra ÚNICAMENT el podi final: Campió, Subcampió i 3r Lloc.
 * No mostra el detall dels creuaments de semifinals/final/consolació.
 */
export default function CompetitionBrackets() {
  const semifinals = useSelector(selectSemifinalMatches);
  const final = useSelector(selectFinalMatches);
  const thirdPlace = useSelector(selectThirdPlaceMatches);

  // comprovem si ja hi ha partits de semifinals o de final creats
  const hasElimination = semifinals.length > 0 || final.length > 0;

  // si encara estan en fase de grups i no s'ha generat la fase final
  if (!hasElimination) {
    return (
      <div className="text-center py-16 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
          <Trophy size={32} />
        </div>
        <p className="text-sm font-bold text-muted uppercase tracking-widest">
          La fase final d'eliminatòries encara no ha començat.
        </p>
      </div>
    );
  }

  // si la fase eliminatòria ha començat però la final encara no s'ha jugat
  const finalPlayed = final[0]?.finished;

  if (!finalPlayed) {
    return (
      <div className="text-center py-16 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
          <Trophy size={32} />
        </div>
        <p className="text-sm font-bold text-muted uppercase tracking-widest">
          El Quadre d'Honor s'actualitzarà quan acabi la Gran Final.
        </p>
        <p className="text-xs text-muted/60 mt-2">
          La fase eliminatòria està en curs.
        </p>
      </div>
    );
  }

  // si la final s'ha jugat, mostrem el podi complet
  return (
    <div className="animate-in fade-in duration-700 pb-8">
      <Podium 
        finalMatches={final} 
        thirdPlaceMatches={thirdPlace} 
      />
    </div>
  );
}

// helper per a treure ternaris anidats molestos del format dels noms d'equips
function getTeamNameLabel(team) {
  if (!team) {
    return 'Pendent';
  }
  if (team.code) {
    return `${team.code} - ${team.name}`;
  }
  return team.name;
}

/**
 * Component de Podi (Quadre d'Honor)
 * Mostra el campió, subcampió i tercer lloc de la competició.
 */
function Podium({ finalMatches, thirdPlaceMatches }) {
  const finalMatch = finalMatches[0];
  const thirdMatch = thirdPlaceMatches[0];

  if (!finalMatch || !finalMatch.finished) {
    return null;
  }

  // determinem qui s'ha coronat campió del torneig a la gran final
  const isLocalWinnerFinal = 
    finalMatch.goals_local > finalMatch.goals_visitor || 
    finalMatch.winner_id === finalMatch.team_local?.id;
    
  const winner = isLocalWinnerFinal ? finalMatch.team_local : finalMatch.team_visitor;
  const runnerUp = isLocalWinnerFinal ? finalMatch.team_visitor : finalMatch.team_local;

  let thirdPlace = null;
  if (thirdMatch && thirdMatch.finished) {
    const isLocalWinnerThird = 
      thirdMatch.goals_local > thirdMatch.goals_visitor || 
      thirdMatch.winner_id === thirdMatch.team_local?.id;
    thirdPlace = isLocalWinnerThird ? thirdMatch.team_local : thirdMatch.team_visitor;
  }

  const winnerLabel = getTeamNameLabel(winner);
  const runnerUpLabel = getTeamNameLabel(runnerUp);
  const thirdLabel = getTeamNameLabel(thirdPlace);

  return (
    <div className="px-4">
      
      <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] text-center mb-10">
        Quadre d'Honor
      </h4>
      
      {/* Podi horitzontal flexible — evita col·lapse en pantalles petites */}
      <div className="flex items-end justify-center max-w-lg mx-auto gap-1 sm:gap-3">
        
        {/* 2n Lloc: Subcampió */}
        <div className="flex-1 flex flex-col items-center">
          <div className="mb-4 text-center">
            <p className="text-[8px] font-bold text-muted uppercase mb-1">Subcampió</p>
            <p 
              className="text-[11px] font-black text-dark leading-none truncate max-w-[120px]" 
              title={runnerUpLabel}
            >
              {runnerUpLabel}
            </p>
          </div>
          
          <div className="w-full rounded-t-2xl h-20 sm:h-28 bg-slate-200 border-x border-t border-black/5 flex items-start justify-center pt-4 shadow-inner">
            <span className="text-2xl font-black text-slate-400">2</span>
          </div>
        </div>

        {/* 1r Lloc: Campió amb copa animada */}
        <div className="flex-1 flex flex-col items-center">
          <div className="mb-6 text-center">
            <Trophy size={24} className="text-amber-500 mx-auto mb-2 drop-shadow-md animate-bounce" />
            <p className="text-[9px] font-black text-amber-600 uppercase mb-1">Campió</p>
            <p 
              className="text-sm font-black text-dark leading-none truncate max-w-[150px]" 
              title={winnerLabel}
            >
              {winnerLabel}
            </p>
          </div>
          
          <div className="w-full rounded-t-3xl h-32 sm:h-44 bg-gradient-to-b from-primary to-primary-hover shadow-xl flex items-start justify-center pt-6">
            <span className="text-5xl font-black text-white drop-shadow-lg">1</span>
          </div>
        </div>

        {/* 3r Lloc: Consolació */}
        <div className="flex-1 flex flex-col items-center">
          <div className="mb-4 text-center">
            <p className="text-[8px] font-bold text-muted uppercase mb-1">3r Lloc</p>
            <p 
              className="text-[11px] font-black text-dark leading-none truncate max-w-[120px]" 
              title={thirdLabel}
            >
              {thirdLabel}
            </p>
          </div>
          
          <div className="w-full rounded-t-2xl h-16 sm:h-20 bg-amber-700/10 border-x border-t border-amber-900/5 flex items-start justify-center pt-4 shadow-inner">
            <span className="text-2xl font-black text-amber-800/40">3</span>
          </div>
        </div>

      </div>

    </div>
  );
}
