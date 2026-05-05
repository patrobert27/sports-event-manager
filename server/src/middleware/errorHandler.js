/**
 * Middleware Global d'Errors
 * 
 * Aquesta funció és la "xarxa de seguretat" de tota l'aplicació.
 * Qualsevol error que passi en un controlador o servei i no hagi estat capturat,
 * acabarà arribant aquí per ser enviat de forma neta a l'usuari.
 */
function errorHandler(error, request, response, next) {
  // 1. Log d'errors per al desenvolupador
  // Imprimim l'error per la consola del servidor perquè puguem veure què ha passat
  console.error("[Error detectat al servidor]:", error);

  // 2. Determinació del codi d'estat (Status Code)
  // Si l'error ja ve amb un codi d'estat (per exemple, un 404), el fem servir.
  // Si no en té cap, vol dir que és un error inesperat i posem el codi 500.
  const statusCode = error.status || 500;
  
  // 3. Preparació de la resposta JSON
  // Creem l'objecte que enviarem al frontend
  const errorResponse = {
    success: false,
    message: error.message || "S'ha produït un error intern del servidor"
  };

  // Si estem treballant en local (mode desenvolupament), incloem també el 'stack'
  // per saber exactament en quina línia de codi ha fallat.
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = error.stack;
  }

  // 4. Enviament de la resposta
  response.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;
