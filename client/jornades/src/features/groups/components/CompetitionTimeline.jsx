import { useSelector } from "react-redux";
import { selectAllMatches } from "../groupSelectors";
import { selectCurrentCompetition } from "../../competition/competitionSelectors";
import { Clock } from "lucide-react";

/**
 * CompetitionTimeline — Vista Dual: Grid (Desktop) i Timeline Vertical (Mòbil)
 */
export default function CompetitionTimeline() {
  const matches = useSelector(selectAllMatches);
  const competition = useSelector(selectCurrentCompetition);

  // si no hi ha partits, mostrem un avís i aturem el render
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
        <p className="text-sm text-muted">
          No hi ha partits programats al calendari encara.
        </p>
      </div>
    );
  }

  // creem un array de numeros per a poder fer un loop sobre les pistes disponibles
  const totalCourts = competition?.available_courts || 1;
  const courts = Array.from({ length: totalCourts }, (_, i) => {
    return i + 1;
  });

  // agrupem per hora perque la gent normal mira abans l'hora que la jornada en un calendari
  const slotsMap = {};

  matches.forEach((m) => {
    const timeKey = new Date(m.start_time).toISOString();

    if (!slotsMap[timeKey]) {
      slotsMap[timeKey] = [];
    }

    slotsMap[timeKey].push(m);
  });

  // ordenem les hores cronologicament de matí a tarda
  const sortedTimes = Object.keys(slotsMap).sort();

  // helper per formatar el nom de l'equip de forma explicita i neta sense ternaris gegants al mig del JSX
  const getTeamLabel = (team) => {
    if (!team) {
      return "???"; // aixo es perque el rival no esta assignat
    }
    if (team.code) {
      return `${team.code} - ${team.name}`;
    }
    return team.name;
  };

  return (
    <div className="space-y-6">

      {/* --- VISTA MÒBIL: Timeline Vertical (Hidden on sm) --- */}
      <div className="block lg:hidden space-y-8">
        {sortedTimes.map((timeKey) => {
          const time = new Date(timeKey);
          const timeStr = time.toLocaleTimeString("ca-ES", {
            hour: "2-digit",
            minute: "2-digit"
          });
          const timeMatches = slotsMap[timeKey];

          return (
            <div key={timeKey} className="pb-6">

              <div className="flex items-center gap-2 mb-3">
                <Clock className="text-primary w-4 h-4 shrink-0" />
                <span className="text-base sm:text-sm font-black text-dark uppercase tracking-tight">
                  {timeStr}
                </span>
              </div>

              {/* llista de partits per a aquesta franja horaria */}
              <div className="grid grid-cols-1 gap-3">
                {timeMatches.map((match) => {
                  const localName = getTeamLabel(match.team_local);
                  const visitorName = getTeamLabel(match.team_visitor);

                  return (
                    <div
                      key={match.id}
                      className={`p-4 rounded-2xl border shadow-sm flex flex-col gap-2 ${match.finished
                          ? 'bg-gray-50/50 border-gray-100 opacity-60'
                          : 'bg-white border-gray-100'
                        }`}
                    >
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-1">
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-0.5 bg-primary/10 rounded-md">
                            <span className="text-[10px] font-black text-primary">
                              PISTA {match.court_number}
                            </span>
                          </div>
                          <span className="text-[9px] font-bold text-muted uppercase tracking-widest">
                            {match.phase.replace('_', ' ')}
                          </span>
                        </div>

                        {match.finished && (
                          <span className="text-[8px] font-black text-success uppercase">
                            Finalitzat
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 flex flex-col gap-1 min-w-0">

                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-dark truncate max-w-[200px]" title={localName}>
                              {localName}
                            </span>
                            {match.finished && (
                              <span className="text-xs font-black shrink-0 ml-2">
                                {match.goals_local}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-dark truncate max-w-[200px]" title={visitorName}>
                              {visitorName}
                            </span>
                            {match.finished && (
                              <span className="text-xs font-black shrink-0 ml-2">
                                {match.goals_visitor}
                              </span>
                            )}
                          </div>

                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {/* --- VISTA DESKTOP: Grid Clàssic (Hidden on mobile) --- */}
      <div className="hidden lg:block overflow-x-auto pb-4 scrollbar-hide">
        <div className="min-w-full">

          {/* capçalera de les pistes al grid desktop */}
          <div className="flex border-b border-gray-100 bg-gray-50/50 rounded-t-3xl overflow-hidden">
            <div className="w-24 shrink-0 p-5 border-r border-gray-100 bg-gray-100/30 text-[10px] font-black text-muted/50 uppercase flex items-center justify-center">
              Hora
            </div>

            {courts.map((c) => (
              <div
                key={c}
                className="flex-1 p-5 text-center text-xs font-black text-dark border-r border-gray-100 last:border-0 uppercase tracking-widest"
              >
                Pista {c}
              </div>
            ))}
          </div>

          {/* reixeta amb les files de partits per franja d'hora */}
          <div className="bg-white border-x border-b border-gray-100 rounded-b-3xl divide-y divide-gray-100">
            {sortedTimes.map((timeKey) => {
              const time = new Date(timeKey);
              const timeStr = time.toLocaleTimeString("ca-ES", {
                hour: "2-digit",
                minute: "2-digit"
              });

              // mapem els partits de la franja horària per tenir un accés directe per pista
              const courtMatches = {};
              slotsMap[timeKey].forEach((m) => {
                courtMatches[m.court_number] = m;
              });

              return (
                <div key={timeKey} className="flex group hover:bg-gray-50/30 transition-colors">

                  <div className="w-24 shrink-0 p-5 border-r border-gray-100 bg-gray-50/30 flex items-center justify-center font-black text-sm text-dark/70 tabular-nums">
                    {timeStr}
                  </div>

                  {courts.map((c) => {
                    const match = courtMatches[c];

                    if (!match) {
                      return (
                        <div key={c} className="flex-1 p-3 border-r border-gray-100 last:border-0 relative">
                          <div className="h-full min-h-[80px] flex items-center justify-center opacity-5">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Lliure</span>
                          </div>
                        </div>
                      );
                    }

                    const localName = getTeamLabel(match.team_local);
                    const visitorName = getTeamLabel(match.team_visitor);

                    return (
                      <div key={c} className="flex-1 p-3 border-r border-gray-100 last:border-0 relative">

                        <div className={`h-full rounded-2xl p-4 border shadow-sm transition-all flex flex-col justify-center gap-2 ${match.finished
                            ? "bg-gray-50/80 border-gray-100 opacity-60"
                            : "bg-white border-primary/5 hover:border-primary/20 hover:shadow-md"
                          }`}>

                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-black text-primary/40 uppercase tracking-tighter">
                              {match.phase.replace('_', ' ')}
                            </span>
                            {match.finished && (
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
                            )}
                          </div>

                          <div className="space-y-1 min-w-0">

                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs font-bold text-dark truncate max-w-[140px]" title={localName}>
                                {localName}
                              </span>
                              {match.finished && (
                                <span className="text-xs font-black shrink-0">
                                  {match.goals_local}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs font-bold text-dark truncate max-w-[140px]" title={visitorName}>
                                {visitorName}
                              </span>
                              {match.finished && (
                                <span className="text-xs font-black shrink-0">
                                  {match.goals_visitor}
                                </span>
                              )}
                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}
