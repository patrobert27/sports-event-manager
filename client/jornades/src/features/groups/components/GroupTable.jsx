/**
 * GroupTable — Taula de classificació d'un grup
 *
 * Props:
 *   group: { group_letter, standings: [{ rank, team_code, team_name, points, played_matches, won_matches, drawn_matches, lost_matches, goals_for, goals_against, goals_difference }] }
 */
export default function GroupTable({ group }) {
  const { group_letter, standings = [] } = group;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      
      {/* pintem la lletra del grup a dalt amb color primary */}
      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-100">
        <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
          {group_letter}
        </span>
        
        <h3 className="font-bold text-dark text-sm">
          Grup {group_letter}
        </h3>
        
        <span className="ml-auto text-xs text-muted">
          {standings.length} equips
        </span>
      </div>

      {/* 
        posem un scroll horitzontal amb min-width per a que no col·lapsi en pantalles de mobil petit.
        si no li posem min-w a la taula, en iphones de 320px no es llegeix res.
      */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[550px]">
          
          <thead>
            <tr className="bg-gray-50/70 text-muted text-xs font-semibold uppercase tracking-wider">
              <th className="text-left px-4 py-2.5 w-6">#</th>
              <th className="text-left px-3 py-2.5">Equip</th>
              <th className="text-center px-2 py-2.5" title="Partits jugats">PJ</th>
              <th className="text-center px-2 py-2.5" title="Victòries">V</th>
              <th className="text-center px-2 py-2.5" title="Empats">E</th>
              <th className="text-center px-2 py-2.5" title="Derrotes">D</th>
              <th className="text-center px-2 py-2.5" title="Gols a favor">GF</th>
              <th className="text-center px-2 py-2.5" title="Gols en contra">GC</th>
              <th className="text-center px-2 py-2.5" title="Diferència de gols">+/-</th>
              <th className="text-center px-3 py-2.5 font-bold text-dark">PTS</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-50">
            {standings.map((s, idx) => {
              
              // estil per pintar la diferencia de gols en verd si es positiu o vermell si es negatiu
              let diffClass = "text-muted";
              if (s.goals_difference > 0) {
                diffClass = "text-green-600";
              } else if (s.goals_difference < 0) {
                diffClass = "text-red-400";
              }

              // formatem el text de la diferencia per posar el "+" davant si es positiu
              const formattedDiff = s.goals_difference > 0 
                ? `+${s.goals_difference}` 
                : s.goals_difference;

              return (
                <tr
                  key={s.team_id || idx}
                  className="transition-colors hover:bg-gray-50/80"
                >
                  <td className="px-4 py-3 text-muted text-xs font-medium">
                    {s.rank ?? idx + 1}
                  </td>
                  
                  {/* ensenyem el codi i el nom de l'equip truncat per si es massa llarg */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-dark">
                        {s.team_code}
                      </span>
                      
                      <span className="text-muted text-xs hidden sm:inline truncate max-w-[120px]">
                        {s.team_name}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-2 py-3 text-center text-muted">
                    {s.played_matches}
                  </td>
                  
                  <td className="px-2 py-3 text-center text-green-600 font-medium">
                    {s.won_matches}
                  </td>
                  
                  <td className="px-2 py-3 text-center text-amber-500">
                    {s.drawn_matches}
                  </td>
                  
                  <td className="px-2 py-3 text-center text-red-400">
                    {s.lost_matches}
                  </td>
                  
                  <td className="px-2 py-3 text-center text-muted">
                    {s.goals_for}
                  </td>
                  
                  <td className="px-2 py-3 text-center text-muted">
                    {s.goals_against}
                  </td>
                  
                  <td className={`px-2 py-3 text-center font-medium text-xs ${diffClass}`}>
                    {formattedDiff}
                  </td>
                  
                  <td className="px-3 py-3 text-center">
                    <span className="font-bold text-dark text-base">
                      {s.points}
                    </span>
                  </td>
                </tr>
              );
            })}

            {standings.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-muted text-sm">
                  Sense dades de classificació
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}
