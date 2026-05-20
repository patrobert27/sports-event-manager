import { useState, useEffect } from "react";
import {
  Trash2,
  Coins,
  Banknote,
  Edit3,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { predictionService } from "../predictionService";
import {
  fetchPredictionsFailure,
  removePrediction,
  setSuccess,
  clearMessages,
} from "../predictionSlice";
import { loadMyPredictions, loadBettingStatus } from "../predictionThunks";
import {
  selectPredictions,
  selectIsLoadingPredictions,
  selectPredictionError,
} from "../predictionSelectors";
import { setUser } from "../../auth/authSlice";
import { apiFetch } from "../../../services/api";
import PredictionModal from "./PredictionModal";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { SuccessAlert, ErrorAlert } from "../../../components/ui/Alerts";

export default function MyPredictionsPanel() {
  const dispatch = useDispatch();

  // selectors de Redux per a obtenir prediccions, estats de carrega i errors
  const predictions = useSelector(selectPredictions);
  const isLoading = useSelector(selectIsLoadingPredictions);
  const error = useSelector(selectPredictionError);
  const success = useSelector((state) => state.predictions.success);
  const isBettingOpen = useSelector((state) => state.predictions.isBettingOpen);

  const { id: competitionId } = useParams();
  
  // estats locals per controlar quina prediccio estem editant o esborrant en cada moment
  const [editingPrediction, setEditingPrediction] = useState(null);
  const [deletingPrediction, setDeletingPrediction] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // carreguem les nostres prediccions i mirem si el professor te les apostes obertes
  useEffect(() => {
    dispatch(loadMyPredictions(competitionId));
    dispatch(loadBettingStatus());
  }, [dispatch, competitionId]);

  // netegem els cartellets d'avisos d'exit als 5 segons per a no tenir la pantalla plena
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [success, dispatch]);

  // quan l'usuari confirma que vol esborrar la predicció, li tornem els credits
  const handleDeleteConfirm = async () => {
    try {
      await predictionService.deletePrediction(deletingPrediction.id);
      
      // la traiem del llistat de Redux a l'instant per a no fer F5
      dispatch(removePrediction(deletingPrediction.id));
      dispatch(setSuccess("Predicció eliminada correctament"));
      
      // tornem a demanar el perfil al servidor per actualitzar el marcador de credits del header
      const updatedUser = await apiFetch("/auth/profile");
      dispatch(setUser(updatedUser.user));
    } catch (error) {
      dispatch(fetchPredictionsFailure(error.message));
    } finally {
      setDeletingPrediction(null);
    }
  };

  // quan l'estudiant edita el marcador o la quantitat de credits invertits
  const handleEditSave = async (data) => {
    setIsSaving(true);
    
    try {
      await predictionService.updatePrediction(
        editingPrediction.id,
        data.goals_local,
        data.goals_visitor,
        data.bet_amount,
      );
      
      setEditingPrediction(null);
      dispatch(setSuccess("Predicció editada correctament"));
      
      // tornem a demanar les prediccions per pintar el nou resultat i recalcular dades
      loadMyPredictions(competitionId)(dispatch);
      
      // refresquem credits de l'usuari per si ha pujat o baixat l'aposta
      const updatedUser = await apiFetch("/auth/profile");
      dispatch(setUser(updatedUser.user));
    } catch (error) {
      dispatch(fetchPredictionsFailure(error.message));
    } finally {
      setIsSaving(false);
    }
  };

  // si encara s'esta connectant a la base de dades i no te dades en memoria, posem spinner
  if (isLoading && (!predictions || predictions.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted/40">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">
          Carregant les teves prediccions...
        </p>
      </div>
    );
  }

  // si no hi ha cap aposta realitzada per l'alumne, ensenyem cartell informatiu de com fer-ho
  if (!predictions || predictions.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted/20">
          <Banknote size={40} />
        </div>
        
        <h3 className="text-lg font-bold text-dark mb-2">
          Encara no has fet cap predicció
        </h3>
        
        <p className="text-muted text-sm max-w-xs mx-auto">
          Ves a la llista de partits i fes la teva primera predicció per començar a guanyar crèdits.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <SuccessAlert message={success} />
        <ErrorAlert message={error} />
      </div>

      {/* graella de dues columnes per a les apostes de l'alumne */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {predictions.map((pred) => {
          return (
            <PredictionCard
              key={pred.id}
              prediction={pred}
              isBettingOpen={isBettingOpen}
              onDelete={() => {
                setDeletingPrediction(pred);
              }}
              onEdit={() => {
                setEditingPrediction(pred);
              }}
            />
          );
        })}
      </div>

      {/* modal de modificacio de gols o credits invertits */}
      {editingPrediction && (
        <PredictionModal
          match={editingPrediction.match}
          prediction={editingPrediction}
          onClose={() => {
            setEditingPrediction(null);
          }}
          onSave={handleEditSave}
          isLoading={isSaving}
        />
      )}

      {/* modal per confirmar que es vol cancel·lar l'aposta i recuperar les monedes */}
      {deletingPrediction && (
        <ConfirmModal
          isOpen={!!deletingPrediction}
          onCancel={() => {
            setDeletingPrediction(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Eliminar predicció"
          message={
            deletingPrediction.match?.status === "FINISHED"
              ? "Vols eliminar aquesta predicció del teu historial?"
              : "Vols cancel·lar aquesta predicció? Recuperaràs els teus crèdits."
          }
          confirmText="Sí, eliminar"
          cancelText="No, mantenir"
          type="danger"
        />
      )}
    </>
  );
}

/**
 * Targeta individual per a cadascuna de les quinieles de l'estudiant
 */
function PredictionCard({ prediction, onDelete, onEdit, isBettingOpen }) {
  const { match, goals_local, goals_visitor, bet_amount } = prediction;

  // comprovem l'estat del partit per saber si esta pendent, actiu (LIVE) o finalitzat
  const isPending = match.status === "PENDING" || (!match.status && !match.finished);
  const isLive = match.status === "IN_PROGRESS";
  const isFinished = match.status === "FINISHED" || match.finished;

  // guanyes si encertes exactament el nombre de gols de tots dos equips
  const isWinner = isFinished &&
    goals_local === match.goals_local &&
    goals_visitor === match.goals_visitor;

  const isLoser = isFinished && !isWinner;

  return (
    <div
      className={`relative bg-white rounded-3xl border shadow-sm overflow-hidden transition-all hover:shadow-md flex flex-col ${
        isWinner
          ? "border-green-200"
          : isLoser
            ? "border-red-200"
            : isFinished
              ? "border-gray-100 grayscale-[0.5]"
              : "border-gray-100"
      }`}
    >
      
      {/* indicadors de l'estat actual del partit o si l'ha encertada */}
      <div className="absolute top-4 right-4 flex gap-2">
        {isLive ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[10px] font-black text-red-600 uppercase tracking-wider animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            En Viu
          </span>
        ) : isWinner ? (
          <span className="px-3 py-1 rounded-full bg-green-50 text-[10px] font-black text-green-600 uppercase tracking-wider">
            Guanyada
          </span>
        ) : isLoser ? (
          <span className="px-3 py-1 rounded-full bg-red-50 text-[10px] font-black text-red-600 uppercase tracking-wider">
            Perduda
          </span>
        ) : isFinished ? (
          <span className="px-3 py-1 rounded-full bg-gray-50 text-[10px] font-black text-muted uppercase tracking-wider">
            Finalitzada
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-blue-50 text-[10px] font-black text-blue-600 uppercase tracking-wider">
            Pendent
          </span>
        )}
      </div>

      <div className="p-6 flex-1">
        
        {/* escuts i noms dels dos equips cara a cara */}
        <div className="flex items-center justify-between mb-8 mt-4">
          
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-lg font-bold text-dark/70 border border-gray-100 uppercase">
              {match.team_local?.code?.slice(0, 2) || '??'}
            </div>
            
            <span className="text-xs font-bold text-dark text-center line-clamp-1">
              {match.team_local?.name || 'Eliminat'}
            </span>
          </div>

          <div className="px-4 text-muted/20 font-black text-xl italic">VS</div>

          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-lg font-bold text-dark/70 border border-gray-100 uppercase">
              {match.team_visitor?.code?.slice(0, 2) || '??'}
            </div>
            
            <span className="text-xs font-bold text-dark text-center line-clamp-1">
              {match.team_visitor?.name || 'Eliminat'}
            </span>
          </div>

        </div>

        {/* panell de comparacio entre el resultat que va apostar l'estudiant i el real en viu */}
        <div className="flex items-center justify-center gap-8 py-4 bg-gray-50/50 rounded-2xl border border-gray-50">
          
          <div className="text-center">
            <p className="text-[10px] font-bold text-muted uppercase mb-1">
              La teva predicció
            </p>
            <p className="text-2xl font-black text-dark tracking-tighter">
              {goals_local} - {goals_visitor}
            </p>
          </div>

          {(isLive || isFinished) && (
            <div className="text-center border-l border-gray-200 pl-8">
              <p className="text-[10px] font-bold text-muted uppercase mb-1">
                Resultat Real
              </p>
              
              <p className={`text-2xl font-black tracking-tighter ${
                isWinner 
                  ? "text-green-600" 
                  : isLoser 
                    ? "text-red-600" 
                    : "text-dark"
              }`}>
                {match.goals_local} - {match.goals_visitor}
              </p>
            </div>
          )}

        </div>

      </div>

      {/* peu de la targeta amb informacio dels credits posats en joc i guanys potencials */}
      <div className="px-6 py-4 bg-gray-50/30 flex items-center justify-between border-t border-gray-50">
        
        <div className="flex items-center gap-3">
          
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-muted uppercase tracking-widest">
              Invertit
            </span>
            <span className="text-sm font-black text-dark flex items-center gap-1">
              <Coins size={12} className="text-accent" /> {bet_amount}
            </span>
          </div>
          
          <div className="w-px h-6 bg-gray-200" />
          
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-muted uppercase tracking-widest">
              {isWinner ? "Guanyat" : "Premi Potencial"}
            </span>
            
            <span className={`text-sm font-black flex items-center gap-1 ${
              isWinner 
                ? "text-green-600" 
                : isLoser 
                  ? "text-red-600" 
                  : "text-primary"
            }`}>
              <Banknote size={12} /> {bet_amount * 2}
            </span>
          </div>

        </div>

        {/* botons per editar o cancel·lar si les apostes estan obertes i el partit no ha començat */}
        <div className="flex items-center gap-2">
          {isPending && isBettingOpen && (
            <button
              onClick={onEdit}
              className="p-2.5 rounded-xl transition-all duration-200 active:scale-90 bg-primary/10 text-primary hover:bg-primary/20 shadow-sm cursor-pointer"
              title="Editar predicció"
            >
              <Edit3 size={16} />
            </button>
          )}

          {((isPending && isBettingOpen) || isFinished) && (
            <button
              onClick={onDelete}
              className="p-2.5 rounded-xl transition-all duration-200 active:scale-90 bg-red-50 text-red-600 hover:bg-red-100 shadow-sm cursor-pointer"
              title={
                isFinished ? "Eliminar de l'historial" : "Cancel·lar predicció"
              }
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

      </div>

      {/* tires de color decoratives finals */}
      {isWinner && <div className="h-1.5 bg-green-500 w-full" />}
      {isLoser && <div className="h-1.5 bg-red-500 w-full" />}

    </div>
  );
}
