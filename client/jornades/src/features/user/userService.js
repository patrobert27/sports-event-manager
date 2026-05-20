import { apiFetch } from "../../services/api";

// aquest servei nomes fa de pont amb el backend per a tota la gestió d'usuaris i rols
const userService = {
  
  // Obté tota la llista de usuaris de l'escola de forma paginada amb filtres
  async fetchUsers({ page = 1, limit = 10, search = "", role } = {}) {
    const params = new URLSearchParams({ 
      page: page, 
      limit: limit 
    });
    
    if (search.trim()) {
      params.set("search", search.trim());
    }
    
    if (role && role !== 'all') {
      params.set("role", role);
    }
    
    const url = `/users?${params.toString()}`;
    
    return await apiFetch(url);
  },

  // Modifica el rol o la informació d'un usuari concret (només per a administradors)
  async updateUser(id, payload) {
    const url = `/users/${id}`;
    
    return await apiFetch(url, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  
  // Esborra un usuari de la base de dades per complet pel seu ID
  async deleteUser(id) {
    const url = `/users/${id}`;
    
    return await apiFetch(url, {
      method: "DELETE"
    });
  },

  // Demana la llista de rols disponibles (Admin, Student, Professor) per omplir els selectors
  async fetchRoles() {
    try {
      
      const rolesData = await apiFetch("/users/roles");
      
      return rolesData;
      
    } catch (error) {
      return [];
    }
  },
};

export default userService;
