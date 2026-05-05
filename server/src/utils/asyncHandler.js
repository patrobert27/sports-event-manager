/**
 * Wrapper per a funcions asíncrones en controladors Express.
 * Captura qualsevol promesa rebutjada i l'envia al middleware d'errors (next)
 * evitant haver de posar try/catch a cada controlador.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
