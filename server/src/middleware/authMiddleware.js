const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../config/data-source");
const User = require("../entities/User");

/**
 * Middleware d'Autenticació
 * 
 * Aquesta funció s'executa abans d'arribar als controladors protegits.
 * El seu objectiu és mirar si qui fa la petició ha iniciat sessió correctament
 * llegint el token JWT que ens envia el navegador.
 */
async function authMiddleware(request, response, next) {
  // 1. Validacions inicials
  // Llegim la capçalera "Authorization" de la petició HTTP
  const authorizationHeader = request.headers.authorization;

  // Si no ens envien cap capçalera, no els deixem passar
  if (!authorizationHeader) {
    return response.status(401).json({ 
      success: false,
      message: "No s'ha proporcionat cap token de sessió" 
    });
  }

  // 2. Lògica d'extracció del token
  // Normalment el token ve amb el format "Bearer EL_TEU_TOKEN_AQUI"
  let sessionToken = "";
  
  if (authorizationHeader.startsWith("Bearer ")) {
    // Si comença amb Bearer, tallem els primers 7 caràcters per quedar-nos només amb el token
    sessionToken = authorizationHeader.slice(7);
  } else {
    // Si no, agafem la capçalera tal qual
    sessionToken = authorizationHeader;
  }

  // 3. Verificació del Token i Càrrega de l'Usuari
  try {
    // Verifiquem que el token és vàlid utilitzant la nostra clau secreta del servidor
    const decodedTokenData = jwt.verify(
      sessionToken, 
      process.env.JWT_SECRET
    );

    // Si el token és vàlid, busquem l'usuari a la base de dades utilitzant l'ID que hem desxifrat
    const userRepository = AppDataSource.getRepository(User);
    
    const userFound = await userRepository.findOne({
      where: { 
        id: decodedTokenData.id 
      },
      // Demanem que ens porti també la informació del seu rol (Admin, Estudiant...)
      relations: { 
        role: true 
      }, 
    });

    // Si l'usuari ja no existeix a la base de dades (per exemple, si s'ha esborrat el compte)
    if (!userFound) {
      return response.status(401).json({ 
        success: false,
        message: "L'usuari d'aquest token ja no existeix" 
      });
    }

    // Guardem l'objecte usuari dins de la petició (request) 
    // perquè els controladors que venen després el puguin fer servir.
    request.user = userFound;
    
    // Cridem a next() per dir-li a Express que ja hem acabat i que pot continuar amb la ruta
    next();

  } catch (error) {
    // 4. Gestió d'errors del token
    
    // Si el token ha caducat o el format és incorrecte
    const isJwtError = error.name === "JsonWebTokenError" || error.name === "TokenExpiredError";
    
    if (isJwtError) {
      return response.status(401).json({ 
        success: false,
        message: "La teva sessió ha caducat o el token no és vàlid. Torna a iniciar sessió." 
      });
    }
    
    // Si és un altre tipus d'error (per exemple, la base de dades ha fallat)
    // l'enviem al gestor d'errors global d'Express
    next(error);
  }
}

module.exports = authMiddleware;
