import { useState, useEffect } from 'react';
import { Settings, Power, Trophy, Award, AlertCircle, CheckCircle2, Coins, Target, Zap, ShieldAlert, ChevronDown, ChevronUp, UserCheck, Star, TrendingDown } from 'lucide-react';
import { apiFetch } from '../services/api';
import { SuccessAlert, ErrorAlert } from '../components/ui/Alerts';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function BettingAdminPage() {
    const [status, setStatus] = useState(null);
    const [rankingVisible, setRankingVisible] = useState(true);
    const [lastWinners, setLastWinners] = useState([]);
    const [prizes, setPrizes] = useState({
        prize_team_1: 0, prize_team_2: 0, prize_team_3: 0, prize_team_4: 0, prize_team_5: 0,
        prize_team_max_goals: 0, penalty_team_most_conceded: 0,
        penalty_bottom_1: -100, penalty_bottom_2: -80, penalty_bottom_3: -50,
        prize_rank_1: 0, prize_rank_2: 0, prize_rank_3: 0, prize_rank_4: 0, prize_rank_5: 0,
        prize_rank_6: 0, prize_rank_7: 0, prize_rank_8: 0, prize_rank_9: 0, prize_rank_10: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    
    // Netejar missatges automàticament
    useEffect(() => {
        if (message.text && message.type === 'success') {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Accordion states
    const [openSections, setOpenSections] = useState({
        system: true,
        individual: false,
        teams: false,
        winners: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statusRes, visibilityRes, winnersRes, prizesRes] = await Promise.all([
                apiFetch('/betting-control/status'),
                apiFetch('/betting-control/ranking-visibility'),
                apiFetch('/betting-control/last-ranking'),
                apiFetch('/betting-control/prizes-config')
            ]);
            setStatus(statusRes.isOpen);
            setRankingVisible(visibilityRes.isVisible);
            setLastWinners(winnersRes || []);
            if (prizesRes) setPrizes(prizesRes);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleToggle = async () => {
        setIsActionLoading(true);
        try {
            const newStatus = !status;
            await apiFetch('/betting-control/toggle', {
                method: 'POST',
                body: JSON.stringify({ isOpen: newStatus })
            });
            setStatus(newStatus);
            setMessage({ type: 'success', text: `Portal d'apostes ${newStatus ? 'obert' : 'tancat'} correctament.` });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleToggleRanking = async () => {
        setIsActionLoading(true);
        try {
            const newStatus = !rankingVisible;
            await apiFetch('/betting-control/toggle-ranking-visibility', {
                method: 'POST',
                body: JSON.stringify({ isVisible: newStatus })
            });
            setRankingVisible(newStatus);
            setMessage({ type: 'success', text: `Visibilitat de rànquings ${newStatus ? 'activada' : 'desactivada'} correctament.` });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSavePrizes = async () => {
        setIsActionLoading(true);
        try {
            await apiFetch('/betting-control/prizes-config', {
                method: 'POST',
                body: JSON.stringify(prizes)
            });
            setMessage({ type: 'success', text: 'Configuració de premis desada correctament.' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCloseSession = async () => {
        setIsActionLoading(true);
        try {
            const res = await apiFetch('/betting-control/close-session', { method: 'POST' });
            setMessage({ 
                type: 'success', 
                text: `Sessió tancada correctament. S'han processat ${res.processed} guanyadors i s'han repartit els premis.` 
            });
            setStatus(false);
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsActionLoading(false);
            setShowCloseConfirm(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Carregant control d'apostes...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-dark rounded-2xl text-white shadow-lg">
                    <Settings size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-dark uppercase tracking-tight">Gestió de Prediccions</h1>
                    <p className="text-muted text-sm font-medium">Configura premis, estats i sessions globals.</p>
                </div>
            </div>

            {message.text && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                    {message.type === 'success' ? (
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-sm text-green-700">
                            <CheckCircle2 size={16} />
                            <span>{message.text}</span>
                        </div>
                    ) : (
                        <ErrorAlert message={message.text} />
                    )}
                </div>
            )}

            {/* Section: System Control */}
            <AdminSection 
                title="Estat del Sistema i Sessió" 
                icon={Power} 
                isOpen={openSections.system} 
                onToggle={() => toggleSection('system')}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 border border-gray-100">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${status ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            <Power size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-dark">Portal de Prediccions</h3>
                            <p className="text-[10px] text-muted font-bold uppercase mt-1">
                                {status ? "Actualment obert" : "Actualment tancat"}
                            </p>
                        </div>
                        <button
                            onClick={handleToggle}
                            disabled={isActionLoading}
                            className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${status ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200' : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-200'}`}
                        >
                            {status ? "Tancar Prediccions" : "Obrir Prediccions"}
                        </button>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 border border-gray-100">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${rankingVisible ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                            <Trophy size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-dark">Visibilitat Rànquing</h3>
                            <p className="text-[10px] text-muted font-bold uppercase mt-1">
                                {rankingVisible ? "Visible per alumnes" : "Ocult per alumnes"}
                            </p>
                        </div>
                        <button
                            onClick={handleToggleRanking}
                            disabled={isActionLoading}
                            className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${rankingVisible ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200' : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-200'}`}
                        >
                            {rankingVisible ? "Amagar Rànquings" : "Mostrar Rànquings"}
                        </button>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 border border-gray-100 md:col-span-2">
                        <div className="w-16 h-16 rounded-full bg-dark flex items-center justify-center text-white">
                            <CheckCircle2 size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-dark">Finalitzar Sessió</h3>
                            <p className="text-xs text-muted font-medium max-w-md mx-auto mt-1">
                                Tanca les prediccions, reparteix premis automàticament i reseteja els punts de la sessió.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCloseConfirm(true)}
                            disabled={isActionLoading}
                            className="w-full md:w-auto px-12 py-3 bg-dark text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200"
                        >
                            Finalitzar Sessió i Repartir Premis
                        </button>
                    </div>
                </div>
            </AdminSection>

            {/* Section: Individual Prizes */}
            <AdminSection 
                title="Configuració Premis Prediccions (Top 10)" 
                icon={UserCheck} 
                isOpen={openSections.individual} 
                onToggle={() => toggleSection('individual')}
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[1,2,3,4,5,6,7,8,9,10].map(rank => (
                            <div key={rank} className="space-y-1">
                                <label className="text-[9px] font-black text-muted uppercase">Top #{rank}</label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        value={prizes[`prize_rank_${rank}`]}
                                        onChange={(e) => setPrizes({...prizes, [`prize_rank_${rank}`]: parseInt(e.target.value) || 0})}
                                        className="w-full bg-gray-50 border-none rounded-lg py-2 px-3 font-bold text-dark text-sm focus:ring-2 focus:ring-primary/20"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-muted/30">CR</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <button 
                            onClick={handleSavePrizes} 
                            disabled={isActionLoading}
                            className="px-8 py-3 bg-dark text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200"
                        >
                            Desar Configuració
                        </button>
                    </div>
                </div>
            </AdminSection>

            {/* Section: Team Prizes */}
            <AdminSection 
                title="Configuració Premis d'Equip" 
                icon={Target} 
                isOpen={openSections.teams} 
                onToggle={() => toggleSection('teams')}
            >
                <div className="space-y-6">
                    <div>
                        <label className="text-[9px] font-black text-primary uppercase flex items-center gap-1 mb-3">
                            <Star size={10}/> Bonificacions — 5 Millors Equips (Més Punts)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map(rank => (
                                <div key={rank} className="space-y-1">
                                    <label className="text-[9px] font-black text-muted uppercase">Equip #{rank}</label>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            value={prizes[`prize_team_${rank}`]}
                                            onChange={(e) => setPrizes({...prizes, [`prize_team_${rank}`]: parseInt(e.target.value) || 0})}
                                            className="w-full bg-gray-50 border-none rounded-lg py-2 px-3 font-bold text-dark text-sm focus:ring-2 focus:ring-primary/20"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-muted/30">CR</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-yellow-600 uppercase flex items-center gap-1"><Zap size={10}/> Equip Més Golejador</label>
                            <div className="relative">
                                <input 
                                    type="number"
                                    value={prizes.prize_team_max_goals}
                                    onChange={(e) => setPrizes({...prizes, prize_team_max_goals: parseInt(e.target.value) || 0})}
                                    className="w-full bg-yellow-50 border-none rounded-lg py-2 px-3 font-bold text-dark text-sm focus:ring-2 focus:ring-yellow-200"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-yellow-300">CR</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-red-600 uppercase flex items-center gap-1"><ShieldAlert size={10}/> Equip Més Golejat (Penalització)</label>
                            <div className="relative">
                                <input 
                                    type="number"
                                    value={prizes.penalty_team_most_conceded}
                                    onChange={(e) => setPrizes({...prizes, penalty_team_most_conceded: parseInt(e.target.value) || 0})}
                                    className="w-full bg-red-50 border-none rounded-lg py-2 px-3 font-bold text-red-600 text-sm focus:ring-2 focus:ring-red-200"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-red-300">CR</span>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-50">
                        <label className="text-[9px] font-black text-red-600 uppercase flex items-center gap-1 mb-3"><TrendingDown size={10}/> Penalitzacions — 3 Pitjors Equips (Menys Punts)</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map(rank => (
                                <div key={rank} className="space-y-1">
                                    <label className="text-[9px] font-black text-red-500 uppercase">Pitjor #{rank}</label>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            value={prizes[`penalty_bottom_${rank}`]}
                                            onChange={(e) => setPrizes({...prizes, [`penalty_bottom_${rank}`]: parseInt(e.target.value) || 0})}
                                            className="w-full bg-red-50 border-none rounded-lg py-2 px-3 font-bold text-red-600 text-sm focus:ring-2 focus:ring-red-200"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-red-300">CR</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleSavePrizes} 
                            disabled={isActionLoading}
                            className="px-8 py-3 bg-dark text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200"
                        >
                            Desar Configuració d'Equips
                        </button>
                    </div>
                </div>
            </AdminSection>

            {/* Section: Last Winners */}
            <AdminSection 
                title="Historial de Guanyadors" 
                icon={Award} 
                isOpen={openSections.winners} 
                onToggle={() => toggleSection('winners')}
            >
                <div className="divide-y divide-gray-50 -mx-6 -mb-6">
                    {lastWinners.length === 0 ? (
                        <div className="p-12 text-center text-muted italic text-sm">No hi ha dades de sessions anteriors.</div>
                    ) : (
                        lastWinners.map((winner) => (
                            <div key={winner.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-muted/30 tabular-nums w-4">#{winner.rank}</span>
                                    <div>
                                        <p className="text-sm font-bold text-dark">{winner.user?.first_name} {winner.user?.last_name}</p>
                                        <p className="text-[9px] text-muted font-bold uppercase">{winner.session_points} punts</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 bg-accent/10 rounded-lg">
                                    <Coins size={12} className="text-accent" />
                                    <span className="text-xs font-black text-accent">+{winner.prize_credits}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </AdminSection>

            <ConfirmModal 
                isOpen={showCloseConfirm}
                title="Finalitzar Sessió de Prediccions"
                message="Aquesta acció repartirà els premis individuals configurats, buidarà el rànquing i tancarà el sistema per a tothom."
                onConfirm={handleCloseSession}
                onCancel={() => setShowCloseConfirm(false)}
                confirmText="Sí, Finalitzar"
            />
        </div>
    );
}

function AdminSection({ title, icon: Icon, children, isOpen, onToggle, action }) {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div 
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <Icon size={18} />
                    </div>
                    <h3 className="font-bold text-dark text-sm uppercase tracking-tight">{title}</h3>
                </div>
                <div className="flex items-center gap-4">
                    {action}
                    {isOpen ? <ChevronUp size={20} className="text-muted" /> : <ChevronDown size={20} className="text-muted" />}
                </div>
            </div>
            {isOpen && (
                <div className="p-6 border-t border-gray-50 animate-in slide-in-from-top-2 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
}


