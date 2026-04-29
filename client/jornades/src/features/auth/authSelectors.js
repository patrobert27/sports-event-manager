// Selectors d'autenticació
// Aquest fitxer conté funcions per accedir fàcilment a parts concretes de l'estat d'autenticació de Redux

// Retorna tot l'estat d'autenticació
export const selectAuth = (state) => state.auth;
// state = {
//   auth: {
//     user: { name: "Joan", ... },
//     token: "abc123"
//   }
// }


// Retorna l'usuari autenticat
export const selectUser = (state) => state.auth.user;

// Retorna si l'usuari està autenticat
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

// Retorna el token d'autenticació
export const selectToken = (state) => state.auth.token;
