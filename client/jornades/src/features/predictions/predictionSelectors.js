const EMPTY_ARRAY = [];

// deixem aquest selector simple perque el component nomes necessita la llista directa
// no memoitzem ara per no canviar el comportament de Redux ni la seva sincronització
export const selectPredictions = (state) => {
  const list = state.predictions?.predictions || EMPTY_ARRAY;
  
  return list;
};

// comprova si estem descarregant les nostres quinieles des del servidor de l'escola
export const selectIsLoadingPredictions = (state) => {
  const loading = state.predictions.isLoading;
  
  return loading;
};

// error associat a la llista o peticions de quinieles per a poder pintar cartellets
export const selectPredictionError = (state) => {
  const err = state.predictions.error;
  
  return err;
};
