import { useState } from 'react';
import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { Coins, X, Banknote, AlertCircle } from 'lucide-react';

/**
 * PredictionModal
 *
 * Modal per fer o editar una predicció de partit.
 * Props: match, prediction (opcional), onClose, onSave, isLoading
 *
 * FIX RESPONSIVE:
 * Afegit max-h-[90dvh] + overflow-y-auto al contenidor interior
 * perquè el modal no quedi tallat en iOS quan s'obre el teclat virtual.
 * dvh = dynamic viewport height, que s'adapta al teclat en iOS Safari.
 */
export default function PredictionModal({ match, prediction, onClose, onSave, isLoading }) {

  // dades de l'usuari des de Redux per saber quants crèdits té a la butxaca
  const user = useSelector(state => state.auth.user);
  const userCredits = user?.credits || 0;

  // estat local del formulari amb valors vells si estem editant la prediccio
  const [goalsLocal, setGoalsLocal] = useState(prediction?.goals_local || 0);
  const [goalsVisitor, setGoalsVisitor] = useState(prediction?.goals_visitor || 0);
  const [betAmount, setBetAmount] = useState(prediction?.bet_amount || 10);

  // comprovem si l'estudiant té monedes suficients per a l'aposta triada
  const canAfford = userCredits >= betAmount;

  // gestionem l'enviament de la predicció a la base de dades
  const handleSubmit = (e) => {
    e.preventDefault();

    // si no te credits i es aposta nova, bloquegem el submit
    if (!canAfford && !prediction) {
      return;
    }

    onSave({
      matchId: match.id,
      goals_local: goalsLocal,
      goals_visitor: goalsVisitor,
      bet_amount: betAmount,
    });
  };

  return createPortal(
    // fons fosc difuminat per a tapar els partits de darrere
    <div 
      className="fixed inset-0 z-[9999] bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* 
        contenidor del modal.
        limitem el modal a 90dvh per a que no es talli a la meitat quan s'activa el teclat en iphones.
      */}
      <div 
        className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90dvh] flex flex-col border border-blue-50/50 relative"
        onClick={(e) => e.stopPropagation()}
      >

        {/* capçalera de color blau-violeta */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 p-6 text-white relative shrink-0">

          {/* boto X per tancar la finestra sense desar res */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Banknote className="text-accent animate-bounce" size={24} />
            
            <h2 className="text-xl font-bold">
              {prediction ? 'Edita la teva predicció' : 'Fes la teva predicció'}
            </h2>
          </div>

          <p className="text-white/70 text-sm">
            Endevina el resultat i duplica els teus crèdits.
          </p>
        </div>

        {/* cos del formulari amb scroll independent per a viewports de pantalles de mòbil petites */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">

            {/* marcadors de gols de local i visitant amb inputs grans */}
            <div className="flex items-center justify-between gap-4">

              {/* local */}
              <div className="flex-1 text-center">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-3">
                  Local
                </span>
                
                <input
                  type="number"
                  min="0"
                  value={goalsLocal}
                  onChange={(e) => {
                    setGoalsLocal(parseInt(e.target.value) || 0);
                  }}
                  className="w-full h-20 text-center text-4xl font-black rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white transition-all outline-none"
                />
                
                <p className="mt-3 font-bold text-xs text-dark truncate">
                  {match.team_local?.name || 'Eliminat'}
                </p>
              </div>

              {/* etiqueta central VS */}
              <div className="text-muted/20 font-black text-2xl pt-4">VS</div>

              {/* visitant */}
              <div className="flex-1 text-center">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-3">
                  Visitant
                </span>
                
                <input
                  type="number"
                  min="0"
                  value={goalsVisitor}
                  onChange={(e) => {
                    setGoalsVisitor(parseInt(e.target.value) || 0);
                  }}
                  className="w-full h-20 text-center text-4xl font-black rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white transition-all outline-none"
                />
                
                <p className="mt-3 font-bold text-xs text-dark truncate">
                  {match.team_visitor?.name || 'Eliminat'}
                </p>
              </div>

            </div>

            {/* selector per triar l'import de l'aposta esportiva */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">

              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-dark flex items-center gap-2">
                  <Coins size={16} className="text-accent" />
                  Quantitat a invertir
                </label>
                
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-muted uppercase">
                    Tens: {userCredits} CR
                  </span>
                  
                  <span className="text-[10px] font-medium text-muted">
                    Mínim 10 crèdits
                  </span>
                </div>
              </div>

              {/* botons rapidets per posar valors comuns de forma comoda en un clic */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[10, 20, 50, 100].map((amount) => {
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setBetAmount(amount);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        betAmount === amount
                          ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                          : 'bg-white text-muted hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {amount}
                    </button>
                  );
                })}
              </div>

              {/* control lliscant per triar exactament els crèdits desitjats de 10 a 500 */}
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={betAmount}
                onChange={(e) => {
                  setBetAmount(parseInt(e.target.value));
                }}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />

              {/* resum final de credits gastats i premi si encertes */}
              <div className="flex justify-between mt-4 items-end">
                
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted mb-1">
                    Total predicció
                  </p>
                  <p className="text-lg font-black text-dark">
                    {betAmount} <span className="text-[10px] text-muted">CRÈDITS</span>
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-green-600 mb-1">
                    Premi potencial
                  </p>
                  <p className="text-lg font-black text-green-600">
                    +{betAmount * 2} <span className="text-[10px]">CRÈDITS</span>
                  </p>
                </div>

              </div>

            </div>

            {/* botó de submit principal per a enviar la prediccio */}
            <button
              type="submit"
              disabled={isLoading || (!canAfford && !prediction)}
              className={`w-full font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer ${
                (!canAfford && !prediction)
                  ? 'bg-gray-100 text-muted cursor-not-allowed shadow-none'
                  : 'bg-dark hover:bg-black text-white shadow-dark/20'
              }`}
            >
              {/* ensenyem un spinner si està de camí o comprovem que tingui prou credits */}
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (!canAfford && !prediction) ? (
                <>
                  <AlertCircle size={18} />
                  Crèdits Insuficients
                </>
              ) : (
                <>
                  {prediction ? 'Guardar Canvis' : 'Confirmar Predicció'}
                  <Banknote size={18} className="group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>

          </form>
        </div>

      </div>
    </div>,
    document.body
  );
}
