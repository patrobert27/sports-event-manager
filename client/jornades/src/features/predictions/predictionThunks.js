import { 
  fetchPredictionsStart, 
  fetchPredictionsSuccess, 
  fetchPredictionsFailure,
  setBettingStatus,
  setRankingVisibility
} from './predictionSlice';

import { predictionService } from './predictionService';
import { apiFetch } from '../../services/api';

// demana la llista de quinieles que ha fet l'estudiant en aquesta jornada
export const loadMyPredictions = (competitionId = null) => {
  return async (dispatch) => {
    
    dispatch(fetchPredictionsStart());
    
    try {
      const response = await predictionService.getMyPredictions(competitionId);
      
      // guardem les apostes de l'estudiant a Redux
      dispatch(fetchPredictionsSuccess(response));
      
    } catch (error) {
      dispatch(fetchPredictionsFailure(error.message));
    }

  };
};

// comprova si les prediccions estan tancades o si el profe ha amagat el rànquing provisional
export const loadBettingStatus = () => {
  return async (dispatch) => {
    
    try {
      const [statusRes, visibilityRes] = await Promise.all([
        apiFetch('/betting-control/status'),
        apiFetch('/betting-control/ranking-visibility')
      ]);
      
      // modifiquem els botons i les pestanyes de la UI segons el control de professors
      dispatch(setBettingStatus(statusRes.isOpen));
      dispatch(setRankingVisibility(visibilityRes.isVisible));
      
    } catch (error) {
      console.error('Error loading betting status/visibility:', error);
    }

  };
};
