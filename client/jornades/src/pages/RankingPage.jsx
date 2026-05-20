import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  User, 
  Gift, 
  Users, 
  Target, 
  ShieldAlert, 
  BarChart3, 
  ChevronDown, 
  ChevronUp, 
  Coins, 
  Banknote, 
  AlertCircle 
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { apiFetch } from '../services/api';
import { loadBettingStatus } from '../features/predictions/predictionThunks';
import { ADMIN_VARIANTS } from '../constants/roles';

export default function RankingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // controlem quina pestanya es veu: apostadors de quiniela, equips de veritat, golejadors...
  const [activeTab, setActiveTab] = useState('apostadors');
  
  // dades que vindran del server. comencen buides perque les carreguem al useEffect
  const [ranking, setRanking] = useState([]);
  const [teamRankings, setTeamRankings] = useState({ 
    byPoints: [], 
    byGoalsFor: [], 
    byBottomRank: [] 
  });
  
  // configuracio de premis de la base de dades. aixo ve de la taula de control de credits del profe
  const [prizeConfig, setPrizeConfig] = useState(null);
  
  // per si la jornada s'esta jugant ara mateix. si es LIVE, anem canviant els punts a temps real
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // selector de jornades que ensenyem a dalt per anar variant els rànquings
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompId, setSelectedCompId] = useState(null);
  const [isCompDropdownOpen, setIsCompDropdownOpen] = useState(false);

  // dades de redux pel control d'apostes
  const isBettingOpen = useSelector((state) => {
    return state.predictions.isBettingOpen;
  });
  const isRankingVisible = useSelector((state) => {
    return state.predictions.isRankingVisible;
  });
  const user = useSelector((state) => {
    return state.auth.user;
  });

  const isAdmin = ADMIN_VARIANTS.includes(
    (user?.role?.name || "").toLowerCase()
  );

  // si els rànquings estan ocults i no som admin, el fotem fora perque no xafardeji abans d'hora
  useEffect(() => {
    if (isRankingVisible === false && !isAdmin) {
      navigate('/jornades');
    }
  }, [isRankingVisible, isAdmin, navigate]);

  // demanem les jornades al començar. ens serveixen per posar-les al selector de dalt
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const compsRes = await apiFetch('/jornades');
        const comps = Array.isArray(compsRes) ? compsRes : (compsRes?.data || []);
        
        // no ensenyem les de REGISTRATION perque estaran buides i queda feo no tenir dades de partits
        const activeComps = comps.filter((c) => {
          return c.status !== 'REGISTRATION';
        });
        
        setCompetitions(activeComps);

        // preseleccionem la primera de la llista per defecte
        if (activeComps.length > 0 && !selectedCompId) {
          setSelectedCompId(activeComps[0].id);
        }
      } catch (error) {
        console.error('Error recuperant les competicions del rànquing:', error);
      }
    };

    fetchCompetitions();
    dispatch(loadBettingStatus());
  }, [dispatch]);

  // demanem les dades del rànquing quan triem una jornada diferent al dropdown
  useEffect(() => {
    if (!selectedCompId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. apostadors d'aquesta jornada (els alumnes amb mes encerts)
        const indivRes = await apiFetch(`/users/ranking?limit=10&competitionId=${selectedCompId}`);
        setRanking(indivRes.data || []);
        setIsLive(indivRes.isLive);

        // 2. configuracio de credits extra que dona el profe per cada lloc
        const prizesRes = await apiFetch('/betting-control/prizes-config');
        setPrizeConfig(prizesRes);

        // 3. posicions dels equips reals segons els marcadors dels partits
        const teamRes = await apiFetch(`/betting-control/team-rankings?competitionId=${selectedCompId}`);
        if (teamRes) {
          setTeamRankings(teamRes);
        }
      } catch (error) {
        console.error('Error carregant dades del rànquing:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedCompId]);

  // spinner de mentrestant per a que no peti el disseny
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  //pestanyes per triar que veure
  const tabs = [
    { 
      id: 'apostadors', 
      label: 'Top Usuaris', 
      mobileLabel: 'Usuaris', 
      icon: Trophy, 
      color: 'text-accent' 
    },
    { 
      id: 'equips', 
      label: 'Top Equips', 
      mobileLabel: 'Equips', 
      icon: Users, 
      color: 'text-primary' 
    },
    { 
      id: 'gols', 
      label: 'Golejadors', 
      mobileLabel: 'Gols', 
      icon: Target, 
      color: 'text-orange-500' 
    },
    { 
      id: 'cua', 
      label: 'Últims Classificats', 
      mobileLabel: 'Últims', 
      icon: ShieldAlert, 
      color: 'text-red-500' 
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'apostadors':
        return (
          <div className="space-y-8">
            {/* cartellet amb els premis configurats del professor */}
            {prizeConfig && (
              <div className="bg-gradient-to-br from-dark to-primary rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center gap-6 border border-white/10">
                <div className="bg-white/10 p-4 rounded-2xl">
                  <Gift size={32} className="text-accent" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-black text-xl uppercase italic tracking-tighter">
                    Premis de la Sessió
                  </h3>
                  <p className="text-white/60 text-sm">
                    Els millors de la jornada s'enduen credits de gratis!
                  </p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                  <PrizeBadge 
                    label="1r Lloc" 
                    amount={prizeConfig.prize_rank_1} 
                    color="bg-accent" 
                  />
                  <PrizeBadge 
                    label="2n Lloc" 
                    amount={prizeConfig.prize_rank_2} 
                    color="bg-gray-400" 
                  />
                  <PrizeBadge 
                    label="3r Lloc" 
                    amount={prizeConfig.prize_rank_3} 
                    color="bg-orange-600" 
                  />
                  <PrizeBadge 
                    label="4t+ Lloc" 
                    amount={prizeConfig.prize_rank_4} 
                    color="bg-primary-light" 
                  />
                </div>
              </div>
            )}
            
            <IndividualRanking 
              ranking={ranking} 
              isLive={isLive} 
            />
          </div>
        );

      case 'equips':
        return (
          <TeamRanking 
            list={isBettingOpen ? (teamRankings?.byPoints || []) : []} 
            title="Classificació Global d'Equips" 
            type="points" 
          />
        );

      case 'gols':
        return (
          <TeamRanking 
            list={isBettingOpen ? (teamRankings?.byGoalsFor || []) : []} 
            title="Equips més Golejadors" 
            type="goals_for" 
          />
        );

      case 'cua':
        return (
          <TeamRanking 
            list={isBettingOpen ? (teamRankings?.byBottomRank || []) : []} 
            title="Cua de la Classificació" 
            type="points" 
            isBad 
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* titol principal i el badge de live */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-dark tracking-tight uppercase">
          Rànquings <span className="text-primary italic">Oficials</span>
        </h1>
        
        <div className="flex justify-center">
          {isLive ? (
            <span className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white text-[10px] rounded-full font-black tracking-widest animate-pulse">
              <div className="w-1.5 h-1.5 bg-white rounded-full" /> 
              SESSIÓ EN VIU
            </span>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1 bg-gray-500 text-white text-[10px] rounded-full font-black tracking-widest">
              DARRERS RESULTATS
            </span>
          )}
        </div>
      </div>

      {/* selector per triar quina jornada volem veure */}
      {competitions.length > 0 && (
        <div className="flex justify-center px-4">
          <div className="relative w-full max-w-sm">
            <button
              onClick={() => {
                setIsCompDropdownOpen(!isCompDropdownOpen);
              }}
              className="w-full pl-6 pr-12 py-3.5 bg-white border border-primary/10 rounded-2xl text-sm font-bold text-dark text-left flex items-center justify-between hover:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm shadow-primary/5 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                  <BarChart3 size={16} />
                </div>
                
                <div className="flex items-center gap-2">
                  <span>
                    {competitions.find(c => c.id === selectedCompId)?.name || 'Selecciona una jornada'}
                  </span>
                  {selectedCompId && (
                    <div 
                      className={`w-2.5 h-2.5 rounded-full ${
                        competitions.find(c => c.id === selectedCompId)?.status === 'FINISHED' 
                          ? 'bg-red-500' 
                          : 'bg-green-500 animate-pulse'
                      }`}
                      title={
                        competitions.find(c => c.id === selectedCompId)?.status === 'FINISHED' 
                          ? 'Finalitzada' 
                          : 'En joc'
                      }
                    />
                  )}
                </div>
              </div>
              
              <ChevronDown 
                size={18} 
                className={`text-primary transition-transform duration-300 ${isCompDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {isCompDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => {
                    setIsCompDropdownOpen(false);
                  }} 
                />
                
                <div className="absolute z-20 w-full mt-2 bg-white border border-primary/10 rounded-2xl shadow-xl shadow-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
                    {competitions.map((comp) => {
                      return (
                        <button
                          key={comp.id}
                          onClick={() => {
                            setSelectedCompId(comp.id);
                            setIsCompDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${
                            selectedCompId === comp.id 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-dark hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {selectedCompId === comp.id && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            )}
                            <span className="truncate">{comp.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <div 
                              className={`w-2.5 h-2.5 rounded-full ${comp.status === 'FINISHED' ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}
                              title={comp.status === 'FINISHED' ? 'Finalitzada' : 'En joc'}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* si no hi ha res actiu per ensenyar */}
      {competitions.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-3xl text-muted italic">
          No hi ha jornades actives en aquest moment.
        </div>
      )}

      {/* pestanyes del rànquing */}
      <div className="flex flex-wrap justify-center gap-2 p-1 bg-gray-100 rounded-3xl w-full md:w-fit mx-auto shadow-inner">
        {tabs.map((tab) => {
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-6 py-2.5 md:py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-dark shadow-md scale-105' 
                  : 'text-muted hover:bg-white/50'
              }`}
            >
              <tab.icon 
                size={14} 
                className={activeTab === tab.id ? tab.color : ''} 
              />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.mobileLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {renderContent()}
      </div>

      {/* text de recordatori per als participants. explica el reset perque els alumnes no s'espantin al veure 0 credits la setmana següent */}
      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex gap-4 items-center">
        <Gift className="text-blue-500 shrink-0" size={24} />
        
        <p className="text-xs text-blue-800 font-medium leading-relaxed">
          <strong>Recorda:</strong> Els premis per prediccions es donen al final de la sessió. Els premis per equip es reparteixen 
          automàticament en finalitzar la fase de grups. Totes les dades es reseten al tancar la sessió acadèmica.
        </p>
      </div>

    </div>
  );
}

// taula d'usuaris amb el podi a dalt
function IndividualRanking({ ranking, isLive }) {
  const [showAll, setShowAll] = useState(false);
  const rankingList = Array.isArray(ranking) ? ranking : [];
  
  // guardem els 3 primers pel podi del top 3
  const topThree = rankingList.slice(0, 3);
  
  // la resta van a la llista (limitat a 10 per defecte per no col·lapsar la pantalla)
  const othersCount = showAll ? rankingList.length : 10;
  const others = rankingList.slice(3, othersCount);

  return (
    <div className="space-y-12">
      
      {/* podi de les 3 posicions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end px-4">
        {topThree[1] && (
          <PodiumCard 
            user={topThree[1]} 
            rank={2} 
            color="text-gray-400" 
            height="h-48" 
            isLive={isLive} 
          />
        )}
        
        {topThree[0] && (
          <PodiumCard 
            user={topThree[0]} 
            rank={1} 
            color="text-accent" 
            height="h-64" 
            isMain 
            isLive={isLive} 
          />
        )}
        
        {topThree[2] && (
          <PodiumCard 
            user={topThree[2]} 
            rank={3} 
            color="text-orange-600" 
            height="h-40" 
            isLive={isLive} 
          />
        )}
      </div>

      {/* llista del 4 en endavant */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="divide-y divide-gray-50">
          
          {others.map((u, idx) => {
            return (
              <div 
                key={u.id} 
                className="px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-6">
                  <span className="w-6 text-sm font-black text-muted/30 tabular-nums">
                    #{idx + 4}
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <User size={18} />
                    </div>
                    
                    <p className="font-bold text-dark">
                      {u.first_name} {u.last_name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-dark">
                    {u.session_points || 0}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                </div>
              </div>
            );
          })}
          
          {ranking.length === 0 && (
            <div className="p-12 text-center text-muted italic">
              Encara no hi ha dades de puntuació. Espera que comenci el joc.
            </div>
          )}

        </div>
        
        {/* botonet per ensenyar tota la llista de rànquings */}
        {rankingList.length > 10 && (
          <button 
            onClick={() => {
              setShowAll(!showAll);
            }}
            className="w-full py-4 bg-gray-50 text-xs font-black uppercase tracking-widest text-muted hover:text-primary hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
          >
            {showAll ? (
              <>
                <ChevronUp size={16} /> 
                Veure'n menys
              </>
            ) : (
              <>
                <ChevronDown size={16} /> 
                Veure'n més ({rankingList.length - 10} més)
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}

// rànquings d'equips del torneig real
function TeamRanking({ list = [], title, type, isBad }) {
  const [showAll, setShowAll] = useState(false);
  const safeList = Array.isArray(list) ? list : [];
  const displayedList = showAll ? safeList : safeList.slice(0, 5);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      
      <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
        <h3 className="font-bold text-dark flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" />
          {title}
        </h3>
      </div>
      
      <div className="divide-y divide-gray-50">
        {safeList.length === 0 ? (
          <div className="p-12 text-center text-muted italic">
            No hi ha dades disponibles per a aquesta jornada esportiva.
          </div>
        ) : (
          displayedList.map((item, idx) => {
            return (
              <div 
                key={item.id} 
                className="px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-6">
                  <span className={`w-6 text-sm font-black tabular-nums ${idx < 3 ? (isBad ? 'text-red-500' : 'text-accent') : 'text-muted/30'}`}>
                    #{idx + 1}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-dark leading-none truncate text-sm md:text-base">
                      {item.team?.name}
                    </p>
                    <p className="text-[9px] text-muted font-bold uppercase mt-1">
                      Grup {item.team?.group?.letter || '-'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-lg font-black tabular-nums ${isBad ? 'text-red-600' : 'text-dark'}`}>
                      {type === 'points' ? item.points : item.goals_for}
                    </p>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-tighter leading-none">
                      {type === 'points' ? 'punts' : 'gols'}
                    </p>
                  </div>
                  
                  {/* avisos verds o vermells per si estan a dalt o penalitzats */}
                  {idx < 5 && !isBad && type === 'points' && (
                    <div className="hidden md:block px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[9px] font-black uppercase tracking-wider">
                      Zona Premi
                    </div>
                  )}
                  {idx < 3 && isBad && (
                    <div className="hidden md:block px-2 py-1 bg-red-100 text-red-700 rounded-lg text-[9px] font-black uppercase tracking-wider">
                      Penalitzat
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* botonet de veure mes per no saturar la vista amb 30 equips de cop */}
      {safeList.length > 5 && (
        <button 
          onClick={() => {
            setShowAll(!showAll);
          }}
          className="w-full py-4 bg-gray-50 text-xs font-black uppercase tracking-widest text-muted hover:text-primary hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
        >
          {showAll ? (
            <>
              <ChevronUp size={16} /> 
              Veure'n menys
            </>
          ) : (
            <>
              <ChevronDown size={16} /> 
              Veure'n més ({safeList.length - 5} més)
            </>
          )}
        </button>
      )}

    </div>
  );
}

// targeta pel podi amb alçades diferents. es merament per fer bonic
function PodiumCard({ user, rank, color, height, isMain, isLive }) {
  return (
    <div className={`relative flex flex-col items-center ${isMain ? 'z-10' : ''}`}>
      
      <div className={`relative mb-6 ${isMain ? 'scale-110' : ''}`}>
        <div className={`w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center border-2 ${isMain ? 'border-accent' : 'border-gray-50'}`}>
          <User size={32} className={isMain ? 'text-accent' : 'text-muted'} />
        </div>
        
        <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full ${isMain ? 'bg-accent' : 'bg-white border-2 border-gray-50'} shadow-lg flex items-center justify-center`}>
          {rank === 1 ? (
            <Award size={18} className="text-white" />
          ) : (
            <span className={`text-xs font-black ${color}`}>
              {rank}
            </span>
          )}
        </div>
      </div>
      
      <div className="text-center mb-6">
        <p className={`font-black text-dark leading-tight ${isMain ? 'text-xl' : 'text-base'}`}>
          {user.first_name}
        </p>
        
        <p className="text-accent font-black text-lg tabular-nums">
          {user.session_points || 0} <span className="text-[10px] uppercase tracking-tighter">{isLive ? 'pts' : 'guanyats'}</span>
        </p>
      </div>
      
      {/* barra de podi visual de color primary per al primer lloc */}
      <div className={`w-full ${height} ${isMain ? 'bg-primary shadow-2xl shadow-primary/20' : 'bg-gray-100'} rounded-t-3xl flex flex-col items-center justify-end pb-4`}>
        <span className={`text-4xl font-black ${isMain ? 'text-white/20' : 'text-gray-300'} italic`}>
          #{rank}
        </span>
      </div>

    </div>
  );
}

// targetes petites pels premis de dalt (credits que s'emporten per posició)
function PrizeBadge({ label, amount, color }) {
  return (
    <div className={`${color} rounded-2xl p-3 text-center shadow-lg border border-white/10`}>
      <p className="text-[9px] font-black uppercase tracking-tighter opacity-80">
        {label}
      </p>
      
      <p className="text-xl font-black tabular-nums">
        {amount}
      </p>
      
      <p className="text-[8px] font-bold uppercase opacity-60">
        crèdits
      </p>
    </div>
  );
}
